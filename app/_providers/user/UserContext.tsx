"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { UserProfile, UserContextType } from "./types";
import { BERTH_PREFERENCES } from "@/types/booking.types";
import { USER_ROLES, UserRole } from "@/types/shared/users";

// Helper function to safely get UserRole
const getValidUserRole = (roleString?: string | null): UserRole => {
  if (roleString && USER_ROLES.includes(roleString as UserRole)) {
    return roleString as UserRole;
  }
  return "USER"; // Default to "USER"
};

const UserContext = createContext<UserContextType>({
  userProfile: null,
  updateUserProfile: () => {},
  generateNaijaRailsId: () => "",
  isLoadingProfile: true,
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: session, status: sessionStatus } = useSession();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const generateNaijaRailsId = useCallback(() => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0");
    return `NR${timestamp}${random}`;
  }, []);

  useEffect(() => {
    const manageProfile = async () => {
      if (sessionStatus === "loading") {
        setIsLoadingProfile(true);
        return;
      }

    if (session?.user?.email) {
        setIsLoadingProfile(true);
        const userEmail = session.user.email;
        const sessionNaijaRailsId = session.user.naijaRailsId;
        const sessionUserName = session.user.name || "";
        const sessionUserImage = session.user.image;
        const sessionUserId = session.user.id;

        let profileData: UserProfile | null = null;
        let fetchedFromServer = false;

        // First try by userId or naijaRailsId via the user API
        const userId = sessionUserId || sessionNaijaRailsId;
        if (userId) {
          try {
            console.log(`Attempting to fetch profile for user ID: ${userId}`);
            const response = await fetch(`/api/user/${userId}`);
            
            const responseStatus = response.status;
            console.log(`Profile fetch response status: ${responseStatus}`);
            
            if (response.ok) {
              const result = await response.json();
              console.log("Profile fetch successful:", result.success);
              
              if (result.success && result.data) {
                profileData = result.data as UserProfile;
                fetchedFromServer = true;
              } else if (response.status !== 404) {
                console.error("Failed to fetch profile by userId, API returned error:", result.message || response.statusText);
              }
            } else if (response.status === 404) {
              console.warn(`User profile not found for ID: ${userId}, will create default profile`);
            } else {
                console.error(`Failed to fetch profile by userId, network/server error (${response.status}):`, response.statusText);
            }
          } catch (error) {
            console.error("Error fetching profile by userId:", error);
          }
        } else {
          console.warn("No user ID or naijaRailsId available in session");
        }

        // If we can't find a profile, create a default one in the database
        if (!fetchedFromServer) {
          console.warn(`Profile not found on server for user: ${userEmail}. Creating default profile.`);
          const newProfileData: UserProfile = {
            id: sessionUserId || "",
            naijaRailsId: sessionNaijaRailsId || generateNaijaRailsId(),
            name: sessionUserName,
            email: userEmail,
            phone: "",
            address: "",
            role: getValidUserRole(session.user.role),
            dob: "",
            image: sessionUserImage || undefined,
            defaultNationality: "Nigerian",
            preferredBerth: BERTH_PREFERENCES.LOWER,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          try {
            // Create the profile in the database
            const createResponse = await fetch(`/api/user/${newProfileData.naijaRailsId}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(newProfileData),
            });
            
            if (createResponse.ok) {
              const result = await createResponse.json();
              if (result.success && result.data) {
                profileData = result.data;
                fetchedFromServer = true;
              }
            }
          } catch (error) {
            console.error("Error creating default profile:", error);
          }
          
          // If we still couldn't create it, use local data
          if (!fetchedFromServer) {
            profileData = newProfileData;
          }
        }

        setUserProfile(profileData);
        if (profileData) {
        localStorage.setItem(
            `userProfile_${userEmail}`,
            JSON.stringify(profileData),
          );
        } else {
          localStorage.removeItem(`userProfile_${userEmail}`);
        }
        setIsLoadingProfile(false);

      } else if (sessionStatus === "unauthenticated") {
        setUserProfile(null);
        localStorage.clear();
        setIsLoadingProfile(false);
      }
    };

    manageProfile();
  }, [session, sessionStatus, generateNaijaRailsId]);

  const updateUserProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!session?.user?.email || !userProfile) return;

    try {
      // First update in the database
      const userId = userProfile.id || userProfile.naijaRailsId;
      if (userId) {
        const response = await fetch(`/api/user/${userId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            // Update local state with returned data
            setUserProfile(result.data);
            localStorage.setItem(
              `userProfile_${session.user.email}`,
              JSON.stringify(result.data),
            );
            return;
          }
        }
      }

      // Fallback to local update if API call fails
      setUserProfile(prevProfile => {
        if (!prevProfile) return null;
        
        const updatedProfile = {
          ...prevProfile,
          ...updates,
          updatedAt: new Date().toISOString(),
        } as UserProfile;

        localStorage.setItem(
          `userProfile_${session.user.email}`,
          JSON.stringify(updatedProfile),
        );
        return updatedProfile;
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      
      // Fallback to local update
      setUserProfile(prevProfile => {
        if (!prevProfile) return null;
        
        const updatedProfile = {
          ...prevProfile,
          ...updates,
          updatedAt: new Date().toISOString(),
        } as UserProfile;

        localStorage.setItem(
          `userProfile_${session.user.email}`,
          JSON.stringify(updatedProfile),
        );
        return updatedProfile;
      });
    }
  }, [session, userProfile]);

  const value = {
    userProfile,
    updateUserProfile,
    generateNaijaRailsId,
    isLoadingProfile,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

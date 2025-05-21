"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";  
import { BERTH_PREFERENCES } from "@/types/shared/booking.types";

export interface NaijaRailsProfile {
  naijaRailsId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  nationality: string;
  defaultNationality: string;
  berthPreference: typeof BERTH_PREFERENCES[keyof typeof BERTH_PREFERENCES];
  preferredBerth: typeof BERTH_PREFERENCES[keyof typeof BERTH_PREFERENCES];
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ProfileContextType {
  profile: NaijaRailsProfile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (profile: Partial<NaijaRailsProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<NaijaRailsProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
      if (!session?.user?.email) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Use user ID or naijaRailsId
        const userId = session.user.id || session.user.naijaRailsId;
        if (!userId) {
          setError("No user ID available in session");
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/user/${userId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch profile: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          // Transform the data to match the NaijaRailsProfile interface
          const transformedData: NaijaRailsProfile = {
            naijaRailsId: data.data.naijaRailsId,
            fullName: data.data.name,
            email: data.data.email,
            phoneNumber: data.data.phone || "",
            nationality: data.data.defaultNationality || "Nigerian",
            defaultNationality: data.data.defaultNationality || "Nigerian",
            berthPreference: data.data.preferredBerth || BERTH_PREFERENCES.LOWER,
            preferredBerth: data.data.preferredBerth || BERTH_PREFERENCES.LOWER,
            image: data.data.image,
            createdAt: new Date(data.data.createdAt),
            updatedAt: new Date(data.data.updatedAt),
          };
          setProfile(transformedData);
          setError(null);
        } else {
          setError(data.message || "Failed to fetch profile");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setProfile(null);
      } finally {
        setLoading(false);
      }
  };

  const updateProfile = useCallback(async (updates: Partial<NaijaRailsProfile>) => {
    if (!session?.user?.email) return;

    try {
      setLoading(true);
      
      // Use user ID or naijaRailsId
      const userId = session.user.id || session.user.naijaRailsId;
      if (!userId) {
        setError("No user ID available in session");
        setLoading(false);
        return;
      }

      // Transform the data to match the User model
      const transformedData = {
        name: updates.fullName,
        phone: updates.phoneNumber,
        // Add any other fields that need transformation
      };

      const response = await fetch(`/api/user/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transformedData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update profile: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        // Transform the response data to match the NaijaRailsProfile interface
        const transformedResult: NaijaRailsProfile = {
          naijaRailsId: result.data.naijaRailsId,
          fullName: result.data.name,
          email: result.data.email,
          phoneNumber: result.data.phone || "",
          nationality: result.data.defaultNationality || "Nigerian",
          defaultNationality: result.data.defaultNationality || "Nigerian",
          berthPreference: result.data.preferredBerth || BERTH_PREFERENCES.LOWER,
          preferredBerth: result.data.preferredBerth || BERTH_PREFERENCES.LOWER,
          image: result.data.image,
          createdAt: new Date(result.data.createdAt),
          updatedAt: new Date(result.data.updatedAt),
        };
        setProfile(transformedResult);
        setError(null);
      } else {
        setError(result.message || "Failed to update profile");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email, session?.user?.id, session?.user?.naijaRailsId]);

  useEffect(() => {
    fetchProfile();
  }, [session?.user?.email]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        error,
        updateProfile,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}

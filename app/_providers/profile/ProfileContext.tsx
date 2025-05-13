"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

export interface NaijaRailsProfile {
  naijaRailsId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  nationality: string;
  defaultNationality: string;
  berthPreference: 'lower' | 'middle' | 'upper' | 'side';
  preferredBerth: 'lower' | 'middle' | 'upper' | 'side';
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
      const response = await fetch(`/api/profile?email=${session.user.email}`);
      if (!response.ok) throw new Error("Failed to fetch Naija Rails profile");
      const data = await response.json();
      setProfile(data);
      setError(null);
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
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...updates, email: session.user.email }),
      });

      if (!response.ok) throw new Error("Failed to update Naija Rails profile");
      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email]);

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

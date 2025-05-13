"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { UserProfile, UserContextType } from "./types";

const UserContext = createContext<UserContextType>({
  userProfile: null,
  updateUserProfile: () => {},
  generateNaijaRailsId: () => "",
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: session } = useSession();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const generateNaijaRailsId = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0");
    return `NR${timestamp}${random}`;
  };

  useEffect(() => {
    // Load user profile from localStorage when session changes
    if (session?.user?.email) {
      const storedProfile = localStorage.getItem(
        `userProfile_${session.user.email}`,
      );
      if (storedProfile) {
        setUserProfile(JSON.parse(storedProfile));
      } else {
        // Create new profile if none exists
        const newProfile: UserProfile = {
          naijaRailsId: generateNaijaRailsId(),
          fullName: session.user.name || "",
          email: session.user.email,
          phone: "",
          address: "",
          defaultNationality: "Nigerian",
          preferredBerth: "lower",
          lastUpdated: new Date(),
        };
        setUserProfile(newProfile);
        localStorage.setItem(
          `userProfile_${session.user.email}`,
          JSON.stringify(newProfile),
        );
      }
    }
  }, [session]);

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    if (!session?.user?.email || !userProfile) return;

    const updatedProfile = {
      ...userProfile,
      ...updates,
      lastUpdated: new Date(),
    };

    setUserProfile(updatedProfile);
    localStorage.setItem(
      `userProfile_${session.user.email}`,
      JSON.stringify(updatedProfile),
    );
  };

  const value = {
    userProfile,
    updateUserProfile,
    generateNaijaRailsId,
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

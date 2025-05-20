"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { ProfileProvider } from "./_providers/profile/ProfileContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ProfileProvider>
        {children}
      </ProfileProvider>
    </SessionProvider>
  );
}

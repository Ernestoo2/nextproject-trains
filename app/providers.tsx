"use client";

import { SessionProvider } from "next-auth/react";
import { ProfileProvider } from "./_providers/profile/ProfileContext";
import { BookingProvider } from "./_providers/booking/BookingContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ProfileProvider>
        <BookingProvider>{children}</BookingProvider>
      </ProfileProvider>
    </SessionProvider>
  );
}

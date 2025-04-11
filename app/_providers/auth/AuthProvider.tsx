"use client";
import { SessionProvider } from "next-auth/react";
import { AuthContextProvider } from "./AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthContextProvider>{children}</AuthContextProvider>
    </SessionProvider>
  );
}

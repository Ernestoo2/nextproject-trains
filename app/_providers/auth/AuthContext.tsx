"use client";
import React, { createContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { signIn, signOut } from "next-auth/react";
import type { AuthContextType, User } from "./types";

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
});

export const AuthContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      setIsAuthenticated(true);
      setUser(session.user as User);
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    setLoading(false);
  }, [status, session]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      });
      if (result?.error) {
        setError(result.error);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut({ redirect: false });
      setUser(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred during logout");
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      await login(email, password);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    error,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

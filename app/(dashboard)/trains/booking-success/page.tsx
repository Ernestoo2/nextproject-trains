"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import BookingSuccess from "./_components/BookingSuccess";

export default function BookingSuccessPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/trains/booking-success");
    }
  }, [status, router]);

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#07561A]"></div>
      </div>
    );
  }

  // Only show booking success component if authenticated
  if (!session) {
    return null;
  }

  return <BookingSuccess />;
}

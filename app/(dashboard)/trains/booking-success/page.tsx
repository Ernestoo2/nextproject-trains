"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { IBookingPaymentDetails } from "../payment/_types/payment.types";
import BookingSuccess from "./_components/BookingSuccess";

export const dynamic = 'force-dynamic';

export default function BookingSuccessPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookingDetails, setBookingDetails] = useState<IBookingPaymentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/trains/booking-success");
      return;
    }

    const storedDetails = localStorage.getItem("lastBookingDetails");
    if (storedDetails) {
      try {
        const parsedDetails = JSON.parse(storedDetails);
        // Validate the required fields
        if (!parsedDetails || !parsedDetails.passengers || !parsedDetails.fareDetails) {
          throw new Error("Invalid booking details format");
        }
        setBookingDetails(parsedDetails);
      } catch (error) {
        console.error("Error parsing booking details:", error);
        toast.error("Failed to load booking details");
        router.push("/");
      }
    } else {
      toast.error("No booking details found");
      router.push("/");
    }
    setIsLoading(false);
  }, [status, router]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#07561A]"></div>
      </div>
    );
  }

  if (!session || !bookingDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4 text-red-600">Unable to load booking details</h1>
          <button
            onClick={() => router.push("/trains/payment")}
            className="bg-[#07561A] text-white px-6 py-2 rounded-md"
          >
            Return to Search
          </button>
        </div>
      </div>
    );
  }

  return <BookingSuccess />;
}

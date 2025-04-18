"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/_providers/user/UserContext";
import { BookingDetails, PaystackPopupConfig } from "./_types/paystack.types";

interface PaystackPopType {
  setup: (config: PaystackPopupConfig) => {
    openIframe: () => void;
  };
}

declare global {
  interface Window {
    PaystackPop: PaystackPopType;
  }
}

export default function PaymentPage() {
  const { data: session } = useSession();
  const { userProfile } = useUser();
  const router = useRouter();
  const params = useSearchParams();
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedDetails = localStorage.getItem("bookingDetails");
      if (storedDetails) {
        setBookingDetails(JSON.parse(storedDetails));
      }
    } catch (err) {
      console.error("Error loading booking details:", err);
      setError("Failed to load booking details");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!session?.user) {
      router.push("/auth/signin");
    }
  }, [session, router]);

  const handlePayment = () => {
    try {
      if (!bookingDetails || !session?.user?.email) {
        setError("Missing booking details or user email");
        return;
      }

      if (!window.PaystackPop) {
        setError("Payment system not initialized");
        return;
      }

      const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
      if (!publicKey) {
        setError("Payment configuration missing");
        return;
      }

      const handler = window.PaystackPop.setup({
        key: publicKey,
        email: session.user.email,
        amount: Math.round(bookingDetails.totalPrice * 100),
        currency: "NGN",
        reference: params.get('ref') || `TR-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
        metadata: {
          booking_details: bookingDetails,
          custom_fields: [
            {
              display_name: "Train Number",
              variable_name: "train_number",
              value: bookingDetails.trainNumber
            },
            {
              display_name: "Class",
              variable_name: "class",
              value: bookingDetails.class
            }
          ]
        },
        callback: (response: any) => {
          console.log("Payment successful!", response);
          // Store booking details for success page
          localStorage.setItem("lastBookingDetails", JSON.stringify(bookingDetails));
          localStorage.removeItem("bookingDetails");
          router.push("/trains/booking-success");
        },
        onClose: () => {
          console.log("Payment window closed");
        }
      });

      handler.openIframe();
    } catch (err) {
      console.error("Payment error:", err);
      setError("Failed to initialize payment");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#07561A]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4 text-red-600">{error}</h1>
          <button
            onClick={() => router.push("/trains/train-search")}
            className="bg-[#07561A] text-white px-6 py-2 rounded-md"
          >
            Return to Search
          </button>
        </div>
      </div>
    );
  }

  if (!bookingDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">No Booking Details Found</h1>
          <button
            onClick={() => router.push("/trains/train-search")}
            className="bg-[#07561A] text-white px-6 py-2 rounded-md"
          >
            Search Trains
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Complete Your Payment</h1>
        
        {/* User Profile Details */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center font-semibold text-[#374151]">
            <span>
              Naija Rails ID:{" "}
              <span className="text-sm font-medium">
                {userProfile?.naijaRailsId}
              </span>
            </span>
            <span className="text-right">
              Booking Reference:{" "}
              <span className="text-sm font-medium">
                {params.get('ref')}
              </span>
            </span>
          </div>
        </div>

        {/* Train Details */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium mb-4">Train Details</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{bookingDetails.trainNumber} - {bookingDetails.trainName}</h3>
                <p className="text-sm text-[#07561A]">Class {bookingDetails.class}</p>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <div>
                <p className="text-sm">{bookingDetails.departureTime}</p>
                <p className="text-sm font-medium">{bookingDetails.departureStation.name}</p>
              </div>
              <div className="text-center">
                <span className="text-xs text-gray-500">Journey</span>
                <div className="w-24 h-0.5 bg-gray-300 my-1"></div>
              </div>
              <div className="text-right">
                <p className="text-sm">{bookingDetails.arrivalTime}</p>
                <p className="text-sm font-medium">{bookingDetails.arrivalStation.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium mb-4">Payment Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Base Fare</span>
              <span>₦{bookingDetails.baseFare.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Taxes & GST (18%)</span>
              <span>₦{bookingDetails.taxAndGST.toLocaleString()}</span>
            </div>
            {bookingDetails.promoDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-₦{bookingDetails.promoDiscount.toLocaleString()}</span>
              </div>
            )}
            <div className="pt-3 border-t">
              <div className="flex justify-between font-medium">
                <span>Total Amount</span>
                <span className="text-lg text-[#07561A]">₦{bookingDetails.totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <button
          onClick={handlePayment}
          className="w-full bg-[#07561A] text-white py-3 rounded-lg font-medium hover:bg-[#064e15] transition-colors"
        >
          Pay ₦{bookingDetails.totalPrice.toLocaleString()}
        </button>
      </div>
    </div>
  );
} 
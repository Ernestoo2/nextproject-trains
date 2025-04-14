"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
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
        amount: Math.round(bookingDetails.totalAmount * 100), // Convert to kobo and ensure integer
        currency: "NGN",
        reference: `TR-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
        metadata: {
          booking_details: bookingDetails,
          custom_fields: [
            {
              display_name: "Train Number",
              variable_name: "train_number",
              value: bookingDetails.trainNumber
            },
            {
              display_name: "Passengers",
              variable_name: "passengers",
              value: bookingDetails.travelers.length.toString()
            }
          ]
        },
        callback: (response: any) => {
          console.log("Payment successful!", response);
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
        
        {/* Booking Summary */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium mb-4">Booking Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Train</span>
              <span>{bookingDetails.trainNumber} - {bookingDetails.trainName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Route</span>
              <span>{bookingDetails.source} → {bookingDetails.destination}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time</span>
              <span>{bookingDetails.departureTime} → {bookingDetails.arrivalTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Class & Quota</span>
              <span>Class {bookingDetails.class} • {bookingDetails.quota} Quota</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Passengers</span>
              <span>{bookingDetails.travelers.length}</span>
            </div>
            <div className="pt-3 border-t">
              <div className="flex justify-between font-medium">
                <span>Total Amount</span>
                <span>₦{bookingDetails.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Passenger Details */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium mb-4">Passenger Details</h2>
          <div className="space-y-4">
            {bookingDetails.travelers.map((traveler, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex justify-between">
                  <span className="font-medium">Passenger {index + 1}</span>
                  <span className="text-gray-600">{traveler.name}</span>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {traveler.age} years • {traveler.gender} • {traveler.nationality} • {traveler.berthPreference} berth
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Button */}
        <button
          onClick={handlePayment}
          className="w-full bg-[#07561A] text-white py-3 rounded-lg font-medium hover:bg-[#064516] transition-colors"
        >
          Pay ₦{bookingDetails.totalAmount.toLocaleString()}
        </button>
      </div>
    </div>
  );
} 
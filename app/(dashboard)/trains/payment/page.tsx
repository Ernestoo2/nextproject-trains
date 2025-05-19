"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/_providers/user/UserContext";
import { useBookingStore } from "@/store/bookingStore";
import {
  IBookingPaymentDetails
} from "./_types/payment.types";
import { BERTH_PREFERENCES } from "@/types/booking.types";
import { toast } from "sonner";
import { usePaystackPayment } from "react-paystack";

// Generate Naija Rails ID
function generateNaijaRailsId(): string {
  const prefix = "NR";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");
  return `${prefix}${timestamp}${random}`;
}

export default function PaymentPage() {
  const { data: session } = useSession();
  const { userProfile, updateUserProfile } = useUser();
  const { bookingState, actions } = useBookingStore();
  const router = useRouter();
  const [bookingDetailsForPayment, setBookingDetailsForPayment] = useState<IBookingPaymentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (session?.user?.email) {
        try {
          // Use the user's ID or naijaRailsId for fetching profile
          const userId = session.user.id || session.user.naijaRailsId;
          if (!userId) {
            console.error("No user ID available in session");
            return;
          }

          const response = await fetch(`/api/user/${userId}`);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch profile: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.success && data.data) {
            // Ensure all required fields are present
            const profileData = {
              naijaRailsId: data.data.naijaRailsId || generateNaijaRailsId(),
              fullName: data.data.name || session.user.name || "",
              email: data.data.email || session.user.email,
              phone: data.data.phone || "",
              address: data.data.address || "",
              defaultNationality: data.data.defaultNationality || "Nigerian",
              preferredBerth: data.data.preferredBerth || BERTH_PREFERENCES.LOWER,
            };
            updateUserProfile(profileData);
          }
        } catch (error) {
          console.error("Error loading user profile:", error);
        }
      }
    };

    loadUserProfile();
  }, [session, updateUserProfile]);

  useEffect(() => {
    try {
      const storedDetails = localStorage.getItem("bookingPaymentDetails");
      if (storedDetails) {
        const parsedDetails: IBookingPaymentDetails = JSON.parse(storedDetails);
        setBookingDetailsForPayment(parsedDetails);
        // Optional: Update zustand store again if needed, though it should be up-to-date
        // For example, to ensure selectedClassId is correctly in the store for payment confirmation step
        if (parsedDetails.selectedClass && bookingState.currentDefaultClassId !== parsedDetails.selectedClass) {
            actions.updateCurrentDefaultClass(parsedDetails.selectedClass);
        }
        // The main source of truth for fare calculation should be the store now.
        // The fareDetails in localStorage are a snapshot.
      } else {
        setError("No booking details found for payment. Please try booking again.");
        toast.error("No booking details found for payment.");
      }
    } catch (err) {
      console.error("Error loading booking details for payment:", err);
      setError("Failed to load booking details for payment");
      toast.error("Failed to load booking details for payment.");
    } finally {
      setIsLoading(false);
    }
  }, [actions]);

  const paystackConfig = {
      reference: (new Date()).getTime().toString(),
    email: session?.user?.email || "",
    amount: (bookingDetailsForPayment?.fareDetails.totalAmount || 0) * 100,
      publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
      metadata: {
        custom_fields: [
          {
          display_name: "Booking Information",
          variable_name: "booking_info",
            value: JSON.stringify({
            scheduleId: bookingDetailsForPayment?.scheduleId,
            trainName: bookingDetailsForPayment?.trainName,
            selectedClass: bookingDetailsForPayment?.selectedClass,
            passengers: bookingDetailsForPayment?.passengers.length,
            totalAmount: bookingDetailsForPayment?.fareDetails.totalAmount,
            pnr: session?.user?.naijaRailsId || userProfile?.naijaRailsId
            })
          }
        ]
      }
    };

  const initializePayment = usePaystackPayment(paystackConfig);

  const handlePaymentSuccess = async () => {
    toast.success("Payment successful! Confirming booking...");

    if (!bookingDetailsForPayment || !bookingDetailsForPayment.selectedClass) {
      console.error("Critical: Booking details or selected class missing at payment success.");
      toast.error("Failed to finalize booking. Critical data missing. Please contact support.");
      router.push("/");
      return;
    }

    try {
      // Group passengers by their selected class
      const passengersByClass = bookingDetailsForPayment.passengers.reduce((acc, passenger) => {
        const classId = passenger.selectedClassId;
        if (!acc[classId]) {
          acc[classId] = [];
        }
        acc[classId].push(passenger);
        return acc;
      }, {} as Record<string, typeof bookingDetailsForPayment.passengers>);

      // Create booking confirmations for each class
      const bookingPromises = Object.entries(passengersByClass).map(async ([classId, passengers]) => {
        const response = await fetch("/api/booking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scheduleId: bookingDetailsForPayment.scheduleId,
            class: classId,
            passengers: passengers.map(p => ({
              name: `${p.firstName} ${p.lastName}`,
              age: p.age,
              gender: p.gender,
              berthPreference: p.berthPreference,
              seatNumber: p.selectedClassId
            })),
            fare: {
              base: bookingDetailsForPayment.fareDetails.baseFare,
              taxes: bookingDetailsForPayment.fareDetails.taxes,
              total: bookingDetailsForPayment.fareDetails.totalAmount,
              discount: bookingDetailsForPayment.fareDetails.discount || 0
            }
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to confirm booking for class ${classId}`);
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.message || `Failed to confirm booking for class ${classId}`);
        }
        return result;
      });

      // Wait for all booking confirmations
      const results = await Promise.all(bookingPromises);
      
      // Store the booking details for the success page
      const successDetails = {
        ...bookingDetailsForPayment,
        bookingId: results[0]?.data?._id,
        status: "CONFIRMED",
        paymentStatus: "PAID"
      };
      
      localStorage.setItem("lastBookingDetails", JSON.stringify(successDetails));
      toast.success("Booking confirmed and seats updated!");
      router.push("/trains/booking-success");
    } catch (error) {
      console.error("Error confirming booking:", error);
      toast.error(
        `Payment was successful, but booking confirmation failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }. Please contact support with PNR: ${session?.user?.naijaRailsId || userProfile?.naijaRailsId}`
      );
      router.push("/");
    }
  };

  const handlePayment = () => {
    if (!bookingDetailsForPayment) {
      toast.error("Booking details not found. Cannot proceed to payment.");
      return;
    }
    if (!session?.user?.email) {
      toast.error("Please sign in to make a payment.");
      router.push("/auth/signin?callbackUrl=/trains/payment");
      return;
    }
    if (!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) {
        toast.error("Payment gateway is not configured. Please contact support.");
        return;
    }

    const finalPaystackConfig = {
        ...paystackConfig,
        amount: (bookingDetailsForPayment?.fareDetails.totalAmount || 0) * 100,
        email: session.user.email,
    };

    initializePayment({
      onSuccess: handlePaymentSuccess,
      onClose: () => {
        toast.info("Payment window closed.");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4 text-red-600">{error}</h1>
          <button
            onClick={() => router.push("/trains/booking-success")}
            className="bg-green-600 text-white px-6 py-2 rounded-md"
          >
            Return to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Booking Reference */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Booking Reference</h2>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-600">PNR Number</p>
              <p className="text-xl font-semibold">{session?.user?.naijaRailsId}</p>
            </div>
            <div>
              <p className="text-gray-600">Booked By</p>
              <p className="text-xl font-semibold">{session?.user?.name}</p>
            </div>
          </div>
              </div>

        {/* Payment Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="border-b pb-4 mb-4">
            <h2 className="text-2xl font-semibold text-[#07561A]">Payment Summary</h2>
            <p className="text-sm text-gray-600">Review your booking details before payment</p>
          </div>

          {/* Journey Details */}
          <div className="mb-6 p-4 bg-[#07561A1A] rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-lg">{bookingDetailsForPayment?.trainName}</h3>
              <span className="text-[#07561A] font-medium">
                {bookingDetailsForPayment?.selectedClass}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{bookingDetailsForPayment?.departureStationName}</p>
                <p className="text-sm text-gray-600">{bookingDetailsForPayment?.departureTime}</p>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm text-gray-600">→</span>
                <span className="text-xs text-gray-500">{bookingDetailsForPayment?.journeyDate}</span>
              </div>
              <div className="text-right">
                <p className="font-medium">{bookingDetailsForPayment?.arrivalStationName}</p>
                <p className="text-sm text-gray-600">{bookingDetailsForPayment?.arrivalTime}</p>
              </div>
            </div>
          </div>

          {/* Passenger Details */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Passenger Details</h3>
            <div className="space-y-3">
              {bookingDetailsForPayment?.passengers.map((passenger, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{passenger.firstName} {passenger.lastName}</p>
                    <p className="text-sm text-gray-600">
                      {passenger.age} years • {passenger.gender} • {passenger.nationality}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-[#07561A]">{passenger.selectedClassId}</p>
                    <p className="text-xs text-gray-500">{passenger.berthPreference}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fare Breakdown */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Fare Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Base Fare ({bookingDetailsForPayment?.passengers.length} passengers):</span>
                <span>₦{bookingDetailsForPayment?.fareDetails.baseFare.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Taxes & GST (8%):</span>
                <span>₦{bookingDetailsForPayment?.fareDetails.taxes.toLocaleString()}</span>
              </div>
              {bookingDetailsForPayment?.fareDetails.discount && bookingDetailsForPayment.fareDetails.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount ({bookingDetailsForPayment.fareDetails.promoCode}):</span>
                  <span>-₦{bookingDetailsForPayment.fareDetails.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-semibold">
                  <span>Total Amount:</span>
                  <span className="text-[#07561A]">₦{bookingDetailsForPayment?.fareDetails.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Reference */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Booking Reference:</span>
              <span className="font-mono bg-gray-100 px-3 py-1 rounded">
                {bookingDetailsForPayment?.scheduleId.slice(-8).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handlePayment}
          disabled={isLoading}
          className="w-full bg-[#07561A] text-white py-3 rounded-lg font-medium hover:bg-[#064e15] transition-colors disabled:bg-gray-400"
        >
          {isLoading ? "Processing..." : `Pay Now ₦${bookingDetailsForPayment?.fareDetails.totalAmount.toLocaleString()}`}
        </button>
      </div>
    </div>
  );
}

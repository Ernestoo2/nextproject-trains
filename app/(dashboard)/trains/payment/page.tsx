"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/_providers/user/UserContext";
import { useBookingStore } from "@/store/bookingStore";
import {
  IBookingPaymentDetails,
  IPaymentStation,
  IPaystackPopProps,
} from "./_types/payment.types";
import { IPaystackInstance } from "./_types/paystack.types";
import { BERTH_PREFERENCES } from "@/types/booking.types";
import { Passenger } from "@/types/shared/trains";

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
  const { bookingState } = useBookingStore();
  const router = useRouter();
  const params = useSearchParams();
  const [bookingDetails, setBookingDetails] =
    useState<IBookingPaymentDetails | null>(null);
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
    if (!userProfile?.email) return;

    const departureStation: IPaymentStation = {
      name: params.get("departureStation") || "",
      code: params.get("departureCode") || "",
    };

    const arrivalStation: IPaymentStation = {
      name: params.get("arrivalStation") || "",
      code: params.get("arrivalCode") || "",
    };

    const config: IPaystackPopProps = {
      email: userProfile.email,
      amount: bookingState.totalAmount * 100, // Convert to kobo
      metadata: {
        bookingDetails: {
          scheduleId: params.get("scheduleId") || "",
          trainId: params.get("trainId") || "",
          trainNumber: params.get("trainNumber") || "",
          trainName: params.get("trainName") || "",
          departureStation,
          arrivalStation,
          departureTime: params.get("departureTime") || "",
          arrivalTime: params.get("arrivalTime") || "",
          class: bookingState.selectedClass || "",
          baseFare: bookingState.baseFare,
          taxes: bookingState.taxes,
          promoDiscount: bookingState.discount,
          has20PercentOffer: bookingState.has20PercentOffer,
          has50PercentOffer: bookingState.has50PercentOffer,
          totalPrice: bookingState.totalAmount,
          date: params.get("date") || "",
          passengers: bookingState.passengers,
        },
      },
      publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
      text: "Pay Now",
      onSuccess: (reference) => {
        console.log("Payment successful", reference);
        // Store booking details for success page
        const successDetails = {
          scheduleId: params.get("scheduleId") || "",
          trainId: params.get("trainId") || "",
          trainNumber: params.get("trainNumber") || "",
          trainName: params.get("trainName") || "",
          departureStation,
          arrivalStation,
          departureTime: params.get("departureTime") || "",
          arrivalTime: params.get("arrivalTime") || "",
          class: bookingState.selectedClass || "",
          baseFare: bookingState.baseFare,
          taxes: bookingState.taxes,
          promoDiscount: bookingState.discount,
          has20PercentOffer: bookingState.has20PercentOffer,
          has50PercentOffer: bookingState.has50PercentOffer,
          totalPrice: bookingState.totalAmount,
          date: params.get("date") || "",
          passengers: bookingState.passengers,
        };
        localStorage.setItem(
          "lastBookingDetails",
          JSON.stringify(successDetails)
        );
        localStorage.removeItem("bookingDetails");
        router.push("/trains/booking-success");
      },
      onClose: () => {
        console.log("Payment cancelled");
      },
    };

    const paystack = window.PaystackPop as unknown as IPaystackInstance;
    const handler = paystack.setup(config);
    handler.openIframe();
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
            onClick={() => router.push("/trains/train-search")}
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
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Payment Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Base Fare:</span>
              <span>₦{bookingState.baseFare.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxes:</span>
              <span>₦{bookingState.taxes.toLocaleString()}</span>
            </div>
            {bookingState.has20PercentOffer && (
              <div className="flex justify-between text-green-600">
                <span>20% Discount:</span>
                <span>-₦{(bookingState.baseFare * 0.2).toLocaleString()}</span>
              </div>
            )}
            {bookingState.has50PercentOffer && (
              <div className="flex justify-between text-green-600">
                <span>50% Discount:</span>
                <span>-₦{(bookingState.baseFare * 0.5).toLocaleString()}</span>
              </div>
            )}
            {bookingState.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Promo Discount:</span>
                <span>-₦{bookingState.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t pt-4">
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>₦{bookingState.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Passenger Details</h2>
          <div className="space-y-4">
            {bookingState.passengers.map((passenger: Passenger, index: number) => (
              <div
                key={index}
                className="border rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-medium">{passenger.firstName} {passenger.lastName}</h3>
                  <p className="text-sm text-gray-600">
                    {passenger.age} years • {passenger.type} •{" "}
                    {passenger.identificationType}
                  </p>
                  <p className="text-sm text-gray-600">
                    Seat: {passenger.seatNumber}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handlePayment}
          disabled={isLoading}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400"
        >
          {isLoading ? "Processing..." : "Pay Now"}
        </button>
      </div>
    </div>
  );
}

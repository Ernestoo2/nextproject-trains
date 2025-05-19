"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { IBookingPaymentDetails } from "../payment/_types/payment.types";

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

  if (!session || !bookingDetails || !bookingDetails.passengers || !bookingDetails.fareDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4 text-red-600">Unable to load booking details</h1>
          <button
            onClick={() => router.push("/")}
            className="bg-[#07561A] text-white px-6 py-2 rounded-md"
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
        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-green-800">Booking Confirmed!</h1>
              <p className="text-green-600">Your train tickets have been booked successfully.</p>
            </div>
          </div>
        </div>

        {/* Booking Reference */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Booking Reference</h2>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-600">PNR Number</p>
              <p className="text-xl font-semibold">{session.user?.naijaRailsId || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600">Booked By</p>
              <p className="text-xl font-semibold">{session.user?.name || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Journey Details */}
        <div className="bg-[#07561A1A] p-6 rounded-lg border-[#07561A] shadow-md mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Journey Details</h3>
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600 text-lg font-semibold">{bookingDetails.trainName || 'N/A'}</p>
            <p className="text-[#07561A]">
              <span className="font-medium">Class {bookingDetails.selectedClass || 'N/A'}</span>
            </p>
          </div>
          <div className="flex justify-between">
            <div className="w-full">
              <p className="text-sm font-normal">
                {bookingDetails.journeyDate ? new Date(bookingDetails.journeyDate).toLocaleDateString() : 'N/A'}
              </p>
              <p className="text-sm font-medium">{bookingDetails.departureTime || 'N/A'}</p>
              <p className="text-sm text-[#6B7280]">{bookingDetails.departureStationName || 'N/A'}</p>
            </div>
            <div className="flex flex-col w-full items-center">
              <span className="text-sm text-[#6B7280]">Direct</span>
              <hr className="border-t border-[#D1D5DB] w-full mt-1" />
            </div>
            <div className="text-right w-4/5">
              <p className="text-sm font-normal">
                {bookingDetails.journeyDate ? new Date(bookingDetails.journeyDate).toLocaleDateString() : 'N/A'}
              </p>
              <p className="text-sm font-medium">{bookingDetails.arrivalTime || 'N/A'}</p>
              <p className="text-sm text-[#6B7280]">{bookingDetails.arrivalStationName || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Passenger Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Passenger Details</h2>
          <div className="space-y-4">
            {bookingDetails.passengers.map((passenger, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-medium">
                    {passenger.firstName || ''} {passenger.lastName || ''}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {passenger.age || 'N/A'} years • {passenger.type || 'N/A'} • {passenger.identificationType || 'N/A'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Payment Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Base Fare:</span>
              <span>₦{(bookingDetails.fareDetails.baseFare || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxes:</span>
              <span>₦{(bookingDetails.fareDetails.taxes || 0).toLocaleString()}</span>
            </div>
            {bookingDetails.fareDetails.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount:</span>
                <span>-₦{bookingDetails.fareDetails.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t pt-4">
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>₦{(bookingDetails.fareDetails.totalAmount || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => router.push("/")}
          className="w-full bg-[#07561A] text-white py-3 rounded-lg font-medium hover:bg-[#064e15] transition-colors"
        >
          Book Another Journey
        </button>
      </div>
    </div>
  );
}

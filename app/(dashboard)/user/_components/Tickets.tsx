"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";

// Define the types locally since the shared types module is not found
interface Passenger {
  name: string;
  age: number;
  gender: string;
  seatNumber?: string;
}

interface Booking {
  id: string;
  scheduleId: string;
  userId: string;
  passengerDetails: Passenger[];
  totalAmount: number;
  paymentStatus: string;
  bookingStatus: string;
  paymentMethod: string;
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
}

interface TicketsProps {
  userId: string;
}

export default function Tickets({ userId }: TicketsProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch(`/api/booking?userId=${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch bookings");
        }
        const data = await response.json();
        setBookings(data.bookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setError("Failed to load bookings. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        {error}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center text-gray-600 p-4">
        No bookings found. Start booking your train tickets!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Booking #{booking.id.slice(-6).toUpperCase()}
              </h3>
              <p className="text-sm text-gray-600">
                {format(new Date(booking.createdAt), "PPP")}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                booking.bookingStatus === "CONFIRMED"
                  ? "bg-green-100 text-green-800"
                  : booking.bookingStatus === "CANCELLED"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {booking.bookingStatus}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Passenger Details</h4>
              {booking.passengerDetails.map((passenger: Passenger, index: number) => (
                <div key={index} className="text-sm text-gray-600">
                  {passenger.name} - {passenger.age} years - {passenger.gender}
                  {passenger.seatNumber && ` (Seat ${passenger.seatNumber})`}
                </div>
              ))}
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Payment Details</h4>
              <div className="text-sm text-gray-600">
                <p>Amount: ₦{booking.totalAmount.toLocaleString()}</p>
                <p>Status: {booking.paymentStatus}</p>
                <p>Method: {booking.paymentMethod}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => window.print()}
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              Download Ticket
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

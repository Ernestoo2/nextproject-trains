"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { MdAirlineSeatReclineNormal, MdDateRange } from "react-icons/md";
import { BookingDocument, BOOKING_STATUS } from "@/types/booking.types";
import { Loader2 } from "lucide-react";

interface ScheduleDetails {
  departureStation: string;
  arrivalStation: string;
  date: string;
}

interface BookingWithSchedule extends Omit<BookingDocument, 'scheduleId'> {
  scheduleId: ScheduleDetails;
}

interface TicketsProps {
  userId?: string;
}

const Tickets: React.FC<TicketsProps> = ({ userId }) => {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<BookingWithSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      const currentUserId = session?.user?.id || userId;
      if (!currentUserId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/bookings?userId=${currentUserId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }
        const data = await response.json();
        if (data.success) {
          setBookings(data.data.bookings);
        } else {
          throw new Error(data.message || 'Failed to fetch bookings');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [session?.user?.id, userId]);

  if (!session?.user && !userId) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Tickets & Bookings</h2>

      {/* Bookings Section */}
      <div className="space-y-4">
        {bookings.map((booking) => (
          <div key={booking._id.toString()} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🚂</span>
                </div>
                <div>
                  <p className="font-medium">PNR: {booking.pnr}</p>
                  <p className="text-gray-600">
                    {booking.scheduleId.departureStation} → {booking.scheduleId.arrivalStation}
                  </p>
                  <div className="flex items-center mt-2 space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MdDateRange className="mr-1" />
                      <p>{new Date(booking.scheduleId.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center">
                      <HiOutlineLocationMarker className="mr-1" />
                      <p>Class: {booking.class}</p>
                    </div>
                    <div className="flex items-center">
                      <MdAirlineSeatReclineNormal className="mr-1" />
                      <p>Passengers: {booking.passengers.length}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    booking.status === BOOKING_STATUS.CONFIRMED
                      ? "bg-green-100 text-green-800"
                      : booking.status === BOOKING_STATUS.PENDING
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {booking.status}
                </span>
                <div className="text-right">
                  <p className="font-medium">₦{booking.fare.total.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">{booking.paymentStatus}</p>
                </div>
                <button 
                  onClick={() => window.open(`/trains/booking-success?pnr=${booking.pnr}`, '_blank')}
                  className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600 transition"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}

        {bookings.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No bookings found
                </div>
        )}
      </div>
    </div>
  );
};

export default Tickets;

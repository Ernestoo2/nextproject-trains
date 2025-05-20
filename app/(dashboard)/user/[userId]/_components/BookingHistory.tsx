"use client";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";

interface Booking {
  _id: string;
  pnr: string;
  scheduleId: {
    trainName: string;
    fromStation: {
      stationName: string;
      stationCode: string;
    };
    toStation: {
      stationName: string;
      stationCode: string;
    };
    departureTime: string;
    arrivalTime: string;
    date: string;
  };
  class: string;
  passengers: Array<{
    name: string;
    age: number;
    gender: string;
    berthPreference: string;
    seatNumber: string;
  }>;
  status: string;
  paymentStatus: string;
  fare: {
    base: number;
    taxes: number;
    total: number;
    discount?: number;
  };
  createdAt: string;
}

interface BookingHistoryProps {
  userId: string;
}

const BookingHistory: React.FC<BookingHistoryProps> = ({ userId }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/booking?userId=${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }
        const data = await response.json();
        if (data.success) {
          setBookings(data.data.bookings);
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast.error("Failed to load booking history");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Booking History</h2>
      <div className="space-y-4">
        {bookings.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No bookings found</p>
        ) : (
          bookings.map((booking) => (
            <div key={booking._id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{booking.scheduleId.trainName}</h3>
                    <span className="text-sm text-gray-500">PNR: {booking.pnr}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {booking.scheduleId.fromStation.stationName} ({booking.scheduleId.fromStation.stationCode}) → {booking.scheduleId.toStation.stationName} ({booking.scheduleId.toStation.stationCode})
                  </p>
                <p className="text-sm text-gray-600">
                    {new Date(booking.scheduleId.departureTime).toLocaleTimeString()} - {new Date(booking.scheduleId.arrivalTime).toLocaleTimeString()}
                </p>
                <p className="text-sm text-gray-600">
                    Date: {new Date(booking.scheduleId.date).toLocaleDateString()}
                  </p>
                  <div className="mt-2">
                    <p className="text-sm font-medium">Passengers:</p>
                    <ul className="text-sm text-gray-600">
                      {booking.passengers.map((passenger, index) => (
                        <li key={index}>
                          {passenger.name} - {passenger.age} years - {passenger.gender} - Seat {passenger.seatNumber}
                        </li>
                      ))}
                    </ul>
                  </div>
              </div>
              <div className="text-right">
                  <span className={`inline-block px-2 py-1 rounded text-xs ${
                    booking.status === "CONFIRMED" ? "bg-green-100 text-green-800" :
                    booking.status === "CANCELLED" ? "bg-red-100 text-red-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {booking.status}
                  </span>
                  <p className="mt-2 text-sm font-medium">
                    ₦{booking.fare.total.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    Booked on {new Date(booking.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BookingHistory;

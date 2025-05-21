"use client";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";

interface Booking {
  _id: string;
  pnr: string;
  scheduleId: {
    train: {
    trainName: string;
      // Add other necessary train fields here if populated and used
    };
    route: {
      fromStation: {
        stationName: string;
        stationCode: string;
      };
      toStation: {
        stationName: string;
        stationCode: string;
      };
      // Add other necessary route fields here if populated and used
    };
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
    // Add other necessary schedule fields here if populated and used
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!userId) {
        setError("User ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/booking?userId=${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }

        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch bookings');
        }

        // The API returns data directly in the data field
        if (!data.data || !Array.isArray(data.data)) {
          throw new Error('Invalid response format');
        }

        setBookings(data.data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setError(error instanceof Error ? error.message : "Failed to load booking history");
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

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Booking Tickets History</h2>
        <div className="text-center text-red-600 py-4">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Booking Tickets History</h2>
      <div className="space-y-4">
        {!bookings || bookings.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No bookings found</p>
        ) : (
          bookings.map((booking) => (
            <div key={booking._id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{booking.scheduleId?.train?.trainName || 'Train Name N/A'}</h3>
                    <span className="text-sm text-gray-500">PNR: {booking.pnr}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {booking.scheduleId?.route?.fromStation?.stationName || 'N/A'} 
                    ({booking.scheduleId?.route?.fromStation?.stationCode || 'N/A'}) → 
                    {booking.scheduleId?.route?.toStation?.stationName || 'N/A'} 
                    ({booking.scheduleId?.route?.toStation?.stationCode || 'N/A'})
                  </p>
                <p className="text-sm text-gray-600">
                    {booking.scheduleId?.departureTime ? new Date(booking.scheduleId.departureTime).toLocaleTimeString() : 'N/A'} - 
                    {booking.scheduleId?.arrivalTime ? new Date(booking.scheduleId.arrivalTime).toLocaleTimeString() : 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                    Date: {booking.scheduleId?.date ? new Date(booking.scheduleId.date).toLocaleDateString() : 'N/A'}
                  </p>
                  <div className="mt-2">
                    <p className="text-sm font-medium">Passengers:</p>
                    <ul className="text-sm text-gray-600">
                      {booking.passengers?.map((passenger, index) => {
                        
                        return (
                        <li key={index}>
                            {passenger.name} - {passenger.age} years - {passenger.gender} - Seat {passenger.seatNumber || 'N/A'} {/* TODO: Backend needs to assign/store actual seat number here */}
                        </li>
                        );
                      })}
                    </ul>
                  </div>
              </div>
              <div className="text-right">
                  <span className={`inline-block px-2 py-1 rounded text-xs ${
                    booking.status === "CONFIRMED" ? "bg-green-100 text-green-800" :
                    booking.status === "CANCELLED" ? "bg-red-100 text-red-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {booking.status || 'PENDING'}
                  </span>
                  <p className="mt-2 text-sm font-medium">
                    ₦{booking.fare?.total?.toLocaleString() || '0'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Booked on {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A'}
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

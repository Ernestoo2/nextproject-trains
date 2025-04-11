'use client';

import { apiService } from '@/app/(dashboard)/trains/_services/api.service';
import { TrainDetails } from '@/app/(dashboard)/trains/train-search/_types/train.types';
import React, { useState, useEffect } from 'react';

interface BookingHistoryProps {
  userId: string;
}

const BookingHistory: React.FC<BookingHistoryProps> = ({ userId }) => {
  const [bookings, setBookings] = useState<TrainDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await apiService.getTrainClasses();
        if (response.success) {
          setBookings(response.data as unknown as TrainDetails[]);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [userId]);

  if (loading) {
    return <div>Loading bookings...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Booking History</h2>
      <div className="space-y-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{booking.trainName}</h3>
                <p className="text-sm text-gray-600">
                  {booking.departureStation} → {booking.arrivalStation}
                </p>
                <p className="text-sm text-gray-600">
                  {booking.departureTime} - {booking.arrivalTime}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Duration: {booking.duration}</p>
                <button className="mt-2 text-sm text-green-600 hover:text-green-700">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingHistory; 
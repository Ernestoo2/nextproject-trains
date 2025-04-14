"use client";

import React from "react";
import { TrainDetails } from "@/app/api/types/types";
import { useSession } from "next-auth/react";

interface BookingRightProps {
  train: TrainDetails;
}

const BookingRight: React.FC<BookingRightProps> = ({ train }) => {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  const {
    trainName,
    departureStation,
    arrivalStation,
    departureTime,
    arrivalTime,
    duration,
    baseFare = 0,
    tatkalCharges = 0,
    gst = 0,
  } = train;

  const totalFare = baseFare + tatkalCharges + gst;

  return (
    <div className="w-full md:w-1/3 bg-white p-6 rounded-lg shadow">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Boarding Details
        </h3>
        <div className="flex justify-between items-center">
          <p className="text-gray-600 text-lg font-semibold">{trainName}</p>
          <p className="text-[#07561A]">
            <span className="font-medium">Class 2A</span> &bull; Tatkal Quota
          </p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Journey Details
        </h3>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-600">{departureStation}</p>
            <p className="text-sm text-gray-500">Departure: {departureTime}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500">→</p>
            <p className="text-sm text-gray-500">{duration}</p>
          </div>
          <div>
            <p className="text-gray-600">{arrivalStation}</p>
            <p className="text-sm text-gray-500">Arrival: {arrivalTime}</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Fare Details
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Base Fare</span>
            <span className="text-gray-800">₹{baseFare}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tatkal Charges</span>
            <span className="text-gray-800">₹{tatkalCharges}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">GST</span>
            <span className="text-gray-800">₹{gst}</span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-semibold">
              <span>Total Fare</span>
              <span>₹{totalFare}</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Passenger Details
        </h3>
        <p className="text-gray-600">{session.user.name}</p>
        <p className="text-sm text-gray-500">{session.user.email}</p>
      </div>
    </div>
  );
};

export default BookingRight;

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/_providers/user/UserContext";
import Image from "next/image";
import QRcode from "../../../../../public/Assets/QRcode.png";
import { BookingDetails } from "../../payment/_types/paystack.types";

export default function BookingSuccess() {
  const router = useRouter();
  const { userProfile } = useUser();
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);

  useEffect(() => {
    // Try to get booking details from localStorage
    const storedBookingDetails = localStorage.getItem("lastBookingDetails");
    if (storedBookingDetails) {
      setBookingDetails(JSON.parse(storedBookingDetails));
    }
  }, []);

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

  const handlePrintTicket = () => {
    window.print();
  };

  const handleDownloadTicket = () => {
    // TODO: Implement ticket download functionality
    alert("Download functionality coming soon!");
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center p-6">
      {/* Success Icon and Message */}
      <div className="text-center">
        <div className="flex justify-center items-center mb-4">
          <div className="w-16 h-16 bg-[#16A34A] rounded-full flex justify-center items-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-[#16A34A]">
          Booking Successful!
        </h1>
        <p className="text-sm text-[#6B7280] mt-2">
          Your e-ticket has been sent to your email address
        </p>
      </div>

      {/* Ticket Details Container */}
      <div className="w-full max-w-4xl mt-8 flex flex-col lg:flex-row gap-6">
        {/* Left Section - Ticket Details */}
        <div className="w-full lg:w-2/3 border border-[#D1D5DB] bg-white rounded-md p-6">
          <div className="flex w-full justify-between items-center font-semibold text-[#374151]">
            <span>
              Naija Rails ID:{" "}
              <span className="text-xs sm:text-sm md:text-base font-medium">
                {userProfile?.naijaRailsId}
              </span>
            </span>
            <span className="text-right">
              Booking Reference:{" "}
              <span className="text-xs sm:text-sm md:text-base font-medium">
                {bookingDetails.trainId}
              </span>
            </span>
          </div>

          <h2 className="text-lg font-bold mt-4">
            {bookingDetails.trainNumber} - {bookingDetails.trainName}
          </h2>

          {/* Date and Locations */}
          <div className="flex justify-between mt-4">
            <div>
              <p className="text-xs sm:text-sm md:text-base">
                {bookingDetails.departureTime}
              </p>
              <p className="text-xs sm:text-sm md:text-base font-medium">
                {bookingDetails.source}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs sm:text-sm md:text-base text-[#9CA3AF]">
                Journey
              </span>
              <hr className="border-t border-[#D1D5DB] w-24 mt-2" />
            </div>
            <div className="text-right">
              <p className="text-xs sm:text-sm md:text-base">
                {bookingDetails.arrivalTime}
              </p>
              <p className="text-xs sm:text-sm md:text-base font-medium">
                {bookingDetails.destination}
              </p>
            </div>
          </div>

          {/* Traveler Details */}
          <div className="mt-6">
            <h3 className="text-lg font-medium">Traveler Details</h3>
            <div className="mt-4 space-y-4">
              {bookingDetails.travelers.map((traveler, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between">
                    <span className="font-medium">Passenger {index + 1}</span>
                    <span className="text-gray-600">{traveler.name}</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    {traveler.age} years • {traveler.gender} • {traveler.nationality} • {traveler.berthPreference} berth
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    Phone: {traveler.phoneNumber}
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    Address: {traveler.address}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Booking Details */}
          <div className="mt-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Class & Quota:</span>
              <span>Class {bookingDetails.class} • {bookingDetails.quota} Quota</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-600">Base Fare (per passenger):</span>
              <span>₦{bookingDetails.baseFare.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-600">Number of Passengers:</span>
              <span>{bookingDetails.travelers.length}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-600">Total Base Fare:</span>
              <span>₦{(bookingDetails.baseFare * bookingDetails.travelers.length).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center mt-2 font-bold">
              <span>Total Amount:</span>
              <span className="text-[#07561A]">₦{bookingDetails.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Right Section - QR Code and Actions */}
        <div className="w-full lg:w-1/3 flex flex-col items-center bg-white border border-[#D1D5DB] rounded-md p-6">
          <div className="flex justify-center items-center">
            <div className="w-32 h-32 bg-gray-200 rounded-md flex items-center justify-center">
              <Image src={QRcode} alt="QR Code" width={128} height={128} />
            </div>
          </div>
          <p className="text-sm mt-4 text-center text-[#6B7280]">
            Scan this QR code at the station for quick access
          </p>

          {/* Buttons */}
          <div className="mt-6 w-full flex flex-col gap-3">
            <button
              onClick={handlePrintTicket}
              className="w-full bg-white text-black border border-[#07561A] py-2 px-4 rounded-md text-sm font-medium"
            >
              Print Ticket
            </button>
            <button
              onClick={() => router.push("/trains/train-search")}
              className="w-full bg-[#07561A] text-white py-2 px-4 rounded-md text-sm font-medium"
            >
              Book Another Train
            </button>
            <button
              onClick={handleDownloadTicket}
              className="w-full bg-[#07561A] text-white py-2 px-4 rounded-md text-sm font-medium"
            >
              Download Ticket
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-sm text-[#6B7280]">
        <p>Cancellation Policy | Terms & Conditions | Travel Insurance</p>
      </div>
    </div>
  );
}

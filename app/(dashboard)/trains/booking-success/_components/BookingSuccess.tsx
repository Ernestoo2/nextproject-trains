"use client"
import QRcode from "../../../../../public/Assets/QRcode.png";
import  { useState } from "react";
import { TicketDetails } from "../types/booking.types";
import {
  DEFAULT_TICKET_DETAILS,
  BUTTON_LABELS,
  SUCCESS_MESSAGES,
} from "../constants/booking.constants";
import Image from "next/image";
//app\dashboard\Trains\BookingSuccess\_components\BookingSuccess.tsx
export default function BookingSuccess () {
  const [ticketDetails] = useState<TicketDetails>(DEFAULT_TICKET_DETAILS);

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
          {SUCCESS_MESSAGES.TITLE}
        </h1>
        <p className="text-sm text-[#6B7280] mt-2">
          {SUCCESS_MESSAGES.SUBTITLE}
        </p>
      </div>

      {/* Ticket Details Container */}
      <div className="w-full max-w-4xl mt-8 flex flex-col lg:flex-row gap-6">
        {/* Left Section - Ticket Details */}
        <div className="w-full lg:w-2/3 border border-[#D1D5DB] bg-white rounded-md p-6">
          <div className="flex w-full justify-between items-center font-semibold text-[#374151]">
            <span>
              PNR No:{" "}
              <span className="text-xs sm:text-sm md:text-base font-medium">
                {ticketDetails.pnr}
              </span>
            </span>
            <span className="text-right">
              Transaction ID:{" "}
              <span className="text-xs sm:text-sm md:text-base font-medium">
                {ticketDetails.transactionId}
              </span>
            </span>
          </div>

          <h2 className="text-lg font-bold mt-4">{ticketDetails.train}</h2>

          {/* Date and Locations */}
          <div className="flex justify-between mt-4">
            <div>
              <p className="text-xs sm:text-sm md:text-base font-medium">
                {ticketDetails.date.departure}
              </p>
              <p className="text-xs sm:text-sm md:text-base">
                {ticketDetails.time.departure}
              </p>
              <p className="text-xs sm:text-sm md:text-base">
                {ticketDetails.locations.departure}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs sm:text-sm md:text-base text-[#9CA3AF]">
                8 hours
              </span>
              <hr className="border-t border-[#D1D5DB] w-24 mt-2" />
            </div>
            <div className="text-right">
              <p className="text-xs sm:text-sm md:text-base font-medium">
                {ticketDetails.date.arrival}
              </p>
              <p className="text-xs sm:text-sm md:text-base">
                {ticketDetails.time.arrival}
              </p>
              <p className="text-xs sm:text-sm md:text-base">
                {ticketDetails.locations.arrival}
              </p>
            </div>
          </div>

          {/* Email and Traveller Details */}
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium mt-6">
              E-Tickets has been sent to:
            </p>
            <p className="text-xs sm:text-sm md:text-base pt-4 text-right whitespace-pre-line">
              {ticketDetails.email}
            </p>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium">Traveller Details</h3>
            <span>
              <p className="text-sm">{ticketDetails.traveller.name}</p>
            </span>

            <div className="flex flex-col sm:flex-row justify-between">
              <div>
                <span className="flex text-xs sm:text-sm md:text-base space-x-2">
                  <p>Age: </p>
                  <p>{ticketDetails.traveller.age}</p>
                </span>
                <span className="flex text-xs sm:text-sm md:text-base space-x-2">
                  <p>Gender: </p>
                  <p>{ticketDetails.traveller.gender}</p>
                </span>
              </div>

              <div className="text-right">
                <span className="flex space-x-2">
                  <p className="text-xs sm:text-sm md:text-base">
                    Booking Status:{" "}
                  </p>
                  <p className="text-xs sm:text-sm md:text-base">
                    {ticketDetails.traveller.status}
                  </p>
                </span>
                <span className="flex space-x-2">
                  <p className="text-xs sm:text-sm md:text-base">
                    Seat/Coach No:
                  </p>
                  <p className="text-xs sm:text-sm md:text-base">
                    {ticketDetails.traveller.seat}
                  </p>
                </span>
              </div>
            </div>
          </div>

          {/* Total Fare */}
          <div className="mt-6 flex justify-between border-t border-[#D1D5DB] pt-4">
            <span className="text-sm font-medium">Total Fare</span>
            <span className="block text-lg font-bold">
              ₹{ticketDetails.fare}
            </span>
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
            {SUCCESS_MESSAGES.QR_CODE_INFO}
          </p>

          {/* Buttons */}
          <div className="mt-6 w-full flex flex-col gap-3">
            <button className="w-full bg-white text-black border border-[#07561A] py-2 px-4 rounded-md text-sm font-medium">
              {BUTTON_LABELS.PRINT_TICKET}
            </button>
            <button className="w-full bg-[#07561A] text-white py-2 px-4 rounded-md text-sm font-medium">
              {BUTTON_LABELS.BOOK_ANOTHER}
            </button>
            <button className="w-full bg-[#07561A] text-white py-2 px-4 rounded-md text-sm font-medium">
              {BUTTON_LABELS.DOWNLOAD_TICKET}
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
};

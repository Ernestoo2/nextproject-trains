"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { MdAirlineSeatReclineNormal, MdDateRange } from "react-icons/md";
import { Ticket, PaymentHistory } from "@/utils/type";

interface TicketsProps {
  userId?: string;
}

const Tickets: React.FC<TicketsProps> = ({ userId }) => {
  const { data: session } = useSession();

  // Mock data - replace with API calls
  const tickets: Ticket[] = [
    {
      id: "1",
      trainNumber: "12430",
      departure: "Lagos",
      arrival: "Enugu",
      time: "08:00 - 14:00",
      date: "2024-04-15",
      gate: "A12",
      seat: "128",
      status: "confirmed",
      trainDetails: {
        id: 1,
        trainName: "PH ENUGU",
        runsOn: "Daily",
        startDate: "2024-04-15",
        endDate: "2024-04-15",
        departureTime: "08:00",
        arrivalTime: "14:00",
        departureStation: "Lagos",
        arrivalStation: "Enugu",
        duration: "6h",
      },
    },
  ];

  const payments: PaymentHistory[] = [
    {
      id: "1",
      amount: 5000,
      date: "2024-04-10",
      status: "completed",
      method: "Card",
      ticketId: "1",
    },
  ];

  if (!session?.user && !userId) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Tickets & Payments</h2>

      {/* Tickets Section */}
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🚂</span>
                </div>
                <div>
                  <p className="font-medium">Train {ticket.trainNumber}</p>
                  <p className="text-gray-600">
                    {ticket.departure} → {ticket.arrival}
                  </p>
                  <div className="flex items-center mt-2 space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MdDateRange className="mr-1" />
                      <p>{ticket.date}</p>
                    </div>
                    <div className="flex items-center">
                      <HiOutlineLocationMarker className="mr-1" />
                      <p>Gate {ticket.gate}</p>
                    </div>
                    <div className="flex items-center">
                      <MdAirlineSeatReclineNormal className="mr-1" />
                      <p>Seat {ticket.seat}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    ticket.status === "confirmed"
                      ? "bg-green-100 text-green-800"
                      : ticket.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {ticket.status.charAt(0).toUpperCase() +
                    ticket.status.slice(1)}
                </span>
                <button className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600 transition">
                  Download Ticket
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Payment History Section */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Payment History</h3>
        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">
                    ₦{payment.amount.toLocaleString()}
                  </p>
                  <p className="text-gray-600">{payment.method}</p>
                  <p className="text-sm text-gray-500">{payment.date}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    payment.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : payment.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {payment.status.charAt(0).toUpperCase() +
                    payment.status.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tickets;

"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import Image from "next/image";

interface Ticket {
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
 
interface TicketsProps {
  userId: string;
}

const Tickets: React.FC<TicketsProps> = ({ userId }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
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
          throw new Error('Failed to fetch tickets');
        }

        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch tickets');
        }

        // Filter only confirmed bookings
        const confirmedTickets = data.data.bookings.filter(
          (booking: Ticket) => booking.status === "CONFIRMED"
        );
        
        setTickets(confirmedTickets);
      } catch (error) {
        console.error("Error fetching tickets:", error);
        setError(error instanceof Error ? error.message : "Failed to load tickets");
        toast.error("Failed to load tickets");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
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
        <h2 className="text-xl font-semibold mb-4">My Tickets</h2>
        <div className="text-center text-red-600 py-4">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">My Tickets</h2>
      <div className="space-y-6">
        {!tickets || tickets.length === 0 ? (
          <div className="text-center py-8">
            <div className="mb-4">
                <Image
                src="/images/no-tickets.svg"
                alt="No tickets"
                width={200}
                height={200}
                className="mx-auto"
                />
              </div>
            <p className="text-gray-500">You don't have any active tickets</p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <div key={ticket._id} className="border rounded-lg overflow-hidden">
              {/* Ticket Header */}
              <div className="bg-green-600 text-white p-4">
                <div className="flex justify-between items-center">
              <div>
                    <h3 className="font-semibold text-lg">{ticket.scheduleId.trainName}</h3>
                    <p className="text-sm opacity-90">PNR: {ticket.pnr}</p>
                  </div>
                  <div className="text-right">
                    <span className="bg-white text-green-600 px-3 py-1 rounded-full text-sm font-medium">
                      {ticket.class}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ticket Body */}
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Journey Details */}
                  <div>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">From</p>
                        <p className="font-semibold">{ticket.scheduleId.fromStation.stationName}</p>
                        <p className="text-sm text-gray-600">{ticket.scheduleId.fromStation.stationCode}</p>
                      </div>
                      <div className="flex-1 text-center">
                        <div className="h-0.5 bg-gray-300 relative">
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">To</p>
                        <p className="font-semibold">{ticket.scheduleId.toStation.stationName}</p>
                        <p className="text-sm text-gray-600">{ticket.scheduleId.toStation.stationCode}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Departure</p>
                        <p className="font-medium">{new Date(ticket.scheduleId.departureTime).toLocaleTimeString()}</p>
                        <p className="text-gray-600">{new Date(ticket.scheduleId.date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Arrival</p>
                        <p className="font-medium">{new Date(ticket.scheduleId.arrivalTime).toLocaleTimeString()}</p>
                        <p className="text-gray-600">{new Date(ticket.scheduleId.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Passenger Details */}
                  <div className="border-l pl-4">
                    <h4 className="font-semibold mb-2">Passenger Details</h4>
                    <div className="space-y-2">
                      {ticket.passengers.map((passenger, index) => (
                        <div key={index} className="text-sm">
                          <p className="font-medium">{passenger.name}</p>
                          <p className="text-gray-600">
                            Seat {passenger.seatNumber} • {passenger.age} years • {passenger.gender}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-500">Total Fare</p>
                      <p className="text-lg font-semibold text-green-600">
                        ₦{ticket.fare.total.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ticket Footer */}
              <div className="bg-gray-50 p-4 border-t">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Booked on {new Date(ticket.createdAt).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() => window.print()}
                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                  >
              Download Ticket
            </button>
          </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Tickets;
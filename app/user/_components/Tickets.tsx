import React from "react";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { MdAirlineSeatReclineNormal, MdDateRange } from "react-icons/md";

interface Ticket {
  id: number;
  departure: string;
  arrival: string;
  time: string;
  date: string;
  gate: string;
  seat: string;
  airlineLogo: string;
}

interface TicketsProps {
  tickets: Ticket[];
}

const Tickets: React.FC<TicketsProps> = ({ tickets }) => {
  return (
    <div>
      <h2 className="text-lg font-bold">Tickets/Bookings</h2>
      <div className="mt-6">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="flex items-center justify-between py-4 px-auto mb-4 rounded shadow"
          >
            <div className="flex items-center pl-2 space-x-2">
              <div className="w-16 h-20 bg-gray-200 rounded-lg">
                <img
                  src={ticket.airlineLogo}
                  alt="Airline Logo"
                  className="object-cover w-full h-full"
                />
              </div>
              <div>
                <p className="font-bold text-base">
                  {ticket.departure} → {ticket.arrival}
                </p>
                <p className="text-gray-600">{ticket.time}</p>
                <div className="flex items-center mt-2 space-x-1 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MdDateRange size={20} className="mr-1 text-gray-500" />
                    <p>{ticket.date}</p>
                  </div>
                  <div className="flex items-center">
                    <HiOutlineLocationMarker
                      size={20}
                      className="mr-1 text-gray-500"
                    />
                    <p>Gate {ticket.gate}</p>
                  </div>
                  <div className="flex items-center">
                    <MdAirlineSeatReclineNormal
                      size={20}
                      className="mr-1 text-gray-500"
                    />
                    <p>Seat {ticket.seat}</p>
                  </div>
                </div>
              </div>
            </div>
            <button className="px-2 py-2 text-white bg-green-500 rounded">
              Download Ticket
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tickets;

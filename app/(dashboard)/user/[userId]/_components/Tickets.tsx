"use client";

import React from "react";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { MdAirlineSeatReclineNormal, MdDateRange } from "react-icons/md";
import Image from "next/image";
import { TrainDetails } from "@/types/shared";
 
interface TicketsProps {
  tickets: TrainDetails[];
}

const Tickets: React.FC<TicketsProps> = ({ tickets }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">My Tickets</h2>
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <div
            key={ticket._id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 relative">
                <Image
                  src="/Assets/Train1.png"
                  alt="Train"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <div>
                <p className="font-semibold">
                  {ticket.routes[0]?.station.name} → {ticket.routes[1]?.station.name}
                </p>
                <p className="text-sm text-gray-600">{ticket.trainName}</p>
                <div className="flex items-center mt-2 space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MdDateRange size={16} className="mr-1 text-gray-500" />
                    <p>{new Date(ticket.routes[0]?.departureTime).toLocaleTimeString()}</p>
                  </div>
                  <div className="flex items-center">
                    <HiOutlineLocationMarker
                      size={16}
                      className="mr-1 text-gray-500"
                    />
                    <p>Platform {ticket.routes[0]?.station.code}</p>
                  </div>
                  <div className="flex items-center">
                    <MdAirlineSeatReclineNormal
                      size={16}
                      className="mr-1 text-gray-500"
                    />
                    <p>Coach {ticket.classes[0]?.code}</p>
                  </div>
                </div>
              </div>
            </div>
            <button className="px-4 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-700">
              Download Ticket
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tickets;

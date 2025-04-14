"use client";
import React, { useState } from "react";
import { FaPlane, FaTrain } from "react-icons/fa6";
import FromToSelector from "./_components/rout-selectors/FromToSelector";
import Tripselector from "./_components/rout-selectors/Tripselector";
import DateSelector from "./_components/rout-selectors/DateSelector";
import PassengerClassSelector from "./_components/rout-selectors/PassengerClassSelector";

interface RouteState {
  trip: string;
  from: string;
  to: string;
  departureDate: string;
  returnDate: string;
}

export default function PageRoute() {
  const [selectedFilter, setSelectedFilter] = useState<"flights" | "stays">(
    "flights",
  );
  const [route, setRoute] = useState<RouteState>({
    trip: "one-way",
    from: "",
    to: "",
    departureDate: "",
    returnDate: "",
  });

  const handleRouteUpdate = (updates: Partial<RouteState>) => {
    setRoute((prev) => ({ ...prev, ...updates }));
  };

  const handleDatesChange = (departure: string, returnDate: string) => {
    handleRouteUpdate({ departureDate: departure, returnDate });
  };

  return (
    <div className="bg-container mb-36 md:mb-[100px]">
      {/* Hero Content */}
      <div className="hero-content">
        <h2 className="text-2xl md:text-3xl mb-2">Helping Others</h2>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Live & Travel</h1>
        <p className="text-lg md:text-xl">
          Ember Special offers to suit your travel comforts
        </p>
      </div>

      {/* Route Container */}
      <div className="route-container md:pb-[-150px] px-[20px]">
        <div className="w-full bg-slate-100 flex rounded shadow-md shadow-slate-600 flex-col">
          {/* Filter Buttons */}
          <div className="flex mx-5 sm:pr-11 sm:mx-20 gap-4 mt-4">
            {/* Flights Button */}
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer ${
                selectedFilter === "flights"
                  ? "border border-[#79747E] bg-gray-200"
                  : "bg-gray-100"
              }`}
              onClick={() => setSelectedFilter("flights")}
            >
              <FaPlane className="text-[#79747E]" />
              <span className="text-sm font-medium text-[#79747E]">
                Flights
              </span>
            </div>
            {/* Stays Button */}
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer ${
                selectedFilter === "stays"
                  ? "border border-[#79747E] bg-gray-200"
                  : "bg-gray-100"
              }`}
              onClick={() => setSelectedFilter("stays")}
            >
              <FaTrain className="text-[#79747E]" />
              <span className="text-sm font-medium text-[#79747E]">Stays</span>
            </div>
          </div>

          {/* Route Selectors */}
          <div className="flex flex-col flex-wrap sm:flex-row sm:justify-center sm:items-center w-full gap-4 p-4">
            <FromToSelector
              value={{ from: route.from, to: route.to }}
              onChange={({ from, to }) => handleRouteUpdate({ from, to })}
            />
            <Tripselector
              value={route.trip}
              onChange={(value) => handleRouteUpdate({ trip: value })}
            />
            <DateSelector onDatesChange={handleDatesChange} />
            <PassengerClassSelector />
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import FromToSelector from "./FromToSelector";
import Tripselector from "./Tripselector";
import DateSelector from "./DateSelector";
import PassengerClassSelector from "./PassengerClassSelector";

interface RouteState {
  trip: string;
  from: string;
  to: string;
}

export default function PageRoute() {
  const [route, setRoute] = useState<RouteState>({
    trip: "one-way",
    from: "",
    to: "",
  });

  const handleDatesChange = (departure: string, returnDate: string) => {
    console.log("Selected dates:", { departure, returnDate });
    // Add your date handling logic here
  };

  const handleRouteUpdate = (updates: Partial<RouteState>) => {
    setRoute((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="flex flex-col flex-wrap sm:flex-row sm:justify-center sm:items-center w-full gap-4">
      {/* 1. From - To */}
      <FromToSelector
        value={{ from: route.from, to: route.to }}
        onChange={({ from, to }) => handleRouteUpdate({ from, to })}
      />

      {/* 2. Trip */}
      <Tripselector
        value={route.trip}
        onChange={(value) => handleRouteUpdate({ trip: value })}
      />

      {/* 3. Depart - Return */}
      <DateSelector onDatesChange={handleDatesChange} />

      {/* 4. Passenger - Class */}
      <PassengerClassSelector />
    </div>
  );
}

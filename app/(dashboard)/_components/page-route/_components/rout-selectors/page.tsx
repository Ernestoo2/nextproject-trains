"use client";
import DateSelector from "./DateSelector";
import FromToSelector from "./FromToSelector";
import PassengerClassSelector from "./PassengerClassSelector";
import React, { useEffect, useState } from "react";
import TripSelector from "./TripSelector";
import { PassengerDetails, SearchParams, Station, TrainClass, TripType } from "@/types/shared/trains";

interface RouteState {
  trip: TripType;
  selectedFrom: string;
  selectedTo: string;
  date: string;
  passengerDetails: PassengerDetails;
  selectedClass: string;
}

export default function PageRoute() {
  const [stations, setStations] = useState<Station[]>([]);
  const [trainClasses, setTrainClasses] = useState<TrainClass[]>([]);
  const [route, setRoute] = useState<RouteState>({
    trip: "ONE_WAY",
    selectedFrom: "",
    selectedTo: "",
    date: new Date().toISOString().split("T")[0],
    passengerDetails: {
      adultCount: 1,
      childCount: 0,
      infantCount: 0,
      classType: "ECONOMY"
    },
    selectedClass: "ECONOMY"
  });

  useEffect(() => {
    // Fetch stations
    fetch('/api/stations')
      .then(res => res.json())
      .then(data => setStations(data))
      .catch(err => console.error('Error loading stations:', err));

    // Fetch train classes
    fetch('/api/train-classes')
      .then(res => res.json())
      .then(data => setTrainClasses(data))
      .catch(err => console.error('Error loading train classes:', err));
  }, []);

  const handleFromChange = (stationId: string) => {
    setRoute(prev => ({ ...prev, selectedFrom: stationId }));
  };

  const handleToChange = (stationId: string) => {
    setRoute(prev => ({ ...prev, selectedTo: stationId }));
  };

  const handleDateChange = (date: string) => {
    setRoute(prev => ({ ...prev, date }));
  };

  const handleTripTypeChange = (tripType: TripType) => {
    setRoute(prev => ({ ...prev, trip: tripType }));
  };

  const handlePassengerClassChange = (details: Partial<PassengerDetails>) => {
    setRoute(prev => ({
      ...prev,
      passengerDetails: { ...prev.passengerDetails, ...details }
    }));
  };

  const handleClassSelect = (classType: string) => {
    setRoute(prev => ({
      ...prev,
      selectedClass: classType,
      passengerDetails: { ...prev.passengerDetails, classType }
    }));
  };

  const handleSearch = () => {
    const searchParams: SearchParams = {
      fromStationId: route.selectedFrom,
      toStationId: route.selectedTo,
      date: route.date,
      tripType: route.trip,
      classType: route.selectedClass,
      passengers: route.passengerDetails
    };

    // Navigate to timetable page with params
    const queryString = new URLSearchParams({
      fromStationId: route.selectedFrom,
      toStationId: route.selectedTo,
      date: route.date,
      tripType: route.trip,
      classType: route.selectedClass,
      adultCount: route.passengerDetails.adultCount.toString(),
      childCount: route.passengerDetails.childCount.toString(),
      infantCount: route.passengerDetails.infantCount.toString()
    }).toString();

    window.location.href = `/trains/train-timetable?${queryString}`;
  };

  return (
    <div className="flex flex-col flex-wrap sm:flex-row sm:justify-center sm:items-center w-full gap-4">
      <FromToSelector
        stations={stations}
        selectedFrom={route.selectedFrom}
        selectedTo={route.selectedTo}
        onFromChange={handleFromChange}
        onToChange={handleToChange}
        date={route.date}
        classType={route.selectedClass}
      />

      <TripSelector
        value={route.trip}
        onChange={(value) => handleTripTypeChange(value as TripType)}
      />

      <DateSelector
        initialDate={route.date}
        onDateChange={handleDateChange}
      />

      <PassengerClassSelector
        availableClasses={trainClasses}
        selectedClass={route.selectedClass}
        passengerCounts={route.passengerDetails}
        onClassSelect={handleClassSelect}
        onPassengerCountChange={handlePassengerClassChange}
      />

      <button
        onClick={handleSearch}
        className="w-full sm:w-auto px-6 py-2 bg-[#07561A] text-white rounded-md hover:bg-[#064a15] transition-colors"
        disabled={!route.selectedFrom || !route.selectedTo || !route.date}
      >
        Search Trains
      </button>
    </div>
  );
}



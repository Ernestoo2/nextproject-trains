"use client";
import React, { useState, useEffect } from "react";
import { FaPlane, FaTrain, FaClock, FaMapMarkerAlt, FaRoute, FaTicketAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";
import FromToSelector from "./_components/rout-selectors/FromToSelector";
import Tripselector from "./_components/rout-selectors/Tripselector";
import DateSelector from "./_components/rout-selectors/DateSelector";
import PassengerClassSelector from "./_components/rout-selectors/PassengerClassSelector";
import { TRIP_TYPES } from "@/(dashboard)/trains/train-search/_constants/train.constants";  

import { 
  Station, 
  TrainClass, 
  Route, 
  PassengerDetails, 
  RouteState 
} from "@/types/route.types";
import { TripType, RouteSummary, DisplayRoute } from "./_type";

// Only keep RouteSummary interface as it's specific to this component

export default function RoutePage() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<"flights" | "stays">("stays");
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedTripType, setSelectedTripType] = useState<TripType>(TRIP_TYPES.ONE_WAY);
  const [routeState, setRouteState] = useState<RouteState>({
    selectedRoute: null,
    selectedTrip: null,
    passengerDetails: {
      classType: "SC",
      adultCount: 1,
      childCount: 0,
      infantCount: 0
    },
    bookingStage: "ROUTE_SELECTION"
  });

  const [selectedFromStation, setSelectedFromStation] = useState<string>("");
  const [selectedToStation, setSelectedToStation] = useState<string>("");
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedFrom, setSelectedFrom] = useState<Station | null>(null);
  const [selectedTo, setSelectedTo] = useState<Station | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [dates, setDates] = useState({
    departure: new Date().toISOString().split('T')[0],
    return: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const [routeSummaries, setRouteSummaries] = useState<RouteSummary[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    fetchStations();
    fetchRouteSummaries();
  }, []);

  const fetchStations = async () => {
    try {
      const response = await fetch("/api/stations");
      const data = await response.json();
      if (data.stations) {
        // Map MongoDB _id to id for TypeScript types
        const mappedStations = data.stations.map((station: any) => ({
          id: station._id,
          name: station.name,
          code: station.code,
          isActive: true
        }));
        setStations(mappedStations);
      }
    } catch (error) {
      console.error("Error fetching stations:", error);
      setError("Failed to load stations");
    }
  };

  const fetchRouteSummaries = async () => {
    try {
      setLoadingSummary(true);
      setError("");

      const searchParams = new URLSearchParams({
        fromStation: selectedFromStation || '',
        toStation: selectedToStation || '',
        date: dates.departure,
        classType: routeState.passengerDetails.classType,
        adultCount: routeState.passengerDetails.adultCount.toString(),
        childCount: routeState.passengerDetails.childCount.toString(),
        infantCount: routeState.passengerDetails.infantCount.toString()
      });

      const response = await fetch(`/api/schedules/search?${searchParams.toString()}`);
      const data = await response.json();
      
      if (response.ok && data.schedules) {
        const transformedSummaries = data.schedules.map((schedule: any) => ({
          _id: schedule._id,
          fromStation: {
            _id: schedule.fromStation,
            name: stations.find(s => s.id === schedule.fromStation)?.name || '',
            code: stations.find(s => s.id === schedule.fromStation)?.code || ''
          },
          toStation: {
            _id: schedule.toStation,
            name: stations.find(s => s.id === schedule.toStation)?.name || '',
            code: stations.find(s => s.id === schedule.toStation)?.code || ''
          },
          distance: schedule.distance || 0,
          baseFare: schedule.baseFare || 0,
          estimatedDuration: schedule.estimatedDuration || '',
          availableClasses: schedule.availableClasses?.map((cls: any) => ({
            name: cls.name || '',
            code: cls.code || '',
            baseFare: cls.baseFare || 0
          })) || [],
          train: {
            _id: schedule.train._id,
            name: schedule.train.name
          }
        }));
        setRouteSummaries(transformedSummaries);
      } else {
        setError(data.error || "Failed to fetch schedules");
        setRouteSummaries([]);
      }
    } catch (error) {
      console.error("Error fetching route summaries:", error);
      setError("Failed to fetch schedules");
      setRouteSummaries([]);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleSearch = async () => {
    if (!selectedFromStation || !selectedToStation) {
      setError("Please select both stations");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/routes/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromStation: selectedFromStation,
          toStation: selectedToStation,
          date: dates.departure,
          classType: routeState.passengerDetails.classType,
          passengers: {
            adult: routeState.passengerDetails.adultCount,
            child: routeState.passengerDetails.childCount,
            infant: routeState.passengerDetails.infantCount
          }
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.routes) {
        setRoutes(data.routes.map((route: any) => ({
          ...route,
          id: route._id,
          fromStation: {
            ...route.fromStation,
            id: route.fromStation._id
          },
          toStation: {
            ...route.toStation,
            id: route.toStation._id
          }
        })));
      } else {
        setError(data.error || "No routes found");
        setRoutes([]);
      }
    } catch (error) {
      console.error("Error searching routes:", error);
      setError("Failed to search routes");
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFromSelect = (station: Station) => {
    setSelectedFrom(station);
    if (station.id === selectedTo?.id) {
      setSelectedTo(null);
    }
  };

  const handleToSelect = (station: Station) => {
    setSelectedTo(station);
    if (station.id === selectedFrom?.id) {
      setSelectedFrom(null);
    }
  };

  const handlePassengerDetailsUpdate = (details: Partial<PassengerDetails>) => {
    setRouteState((prev: RouteState) => ({
      ...prev,
      passengerDetails: {
        ...prev.passengerDetails,
        ...details
      }
    }));
  };

  const handleDatesChange = (departure: string, returnDate: string) => {
    setDates({
      departure,
      return: returnDate
    });
  };

  const handleTripTypeChange = (tripType: string) => {
    setSelectedTripType(tripType as TripType);
  };

  

  const handleViewTimetable = (route?: any) => {
    // If no route provided, use the form data
    const fromId = route ? route.fromStation._id : selectedFromStation;
    const toId = route ? route.toStation._id : selectedToStation;
    
    if (!fromId || !toId) {
      setError("Please select both stations");
      return;
    }

    const searchParams = new URLSearchParams({
      from: fromId,
      to: toId,
      date: dates.departure,
      tripType: selectedTripType,
      classType: routeState.passengerDetails.classType,
      adultCount: routeState.passengerDetails.adultCount.toString(),
      childCount: routeState.passengerDetails.childCount.toString(),
      infantCount: routeState.passengerDetails.infantCount.toString()
    });

    // Add routeId if available
    if (route?._id) {
      searchParams.append('routeId', route._id);
    }

    router.push(`/trains/train-timetable?${searchParams.toString()}`);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Train Route Management</h1>
        
      </div>
    <div className="bg-container mb-36 md:mb-[100px]">
      {/* Hero Content */}
        <div className="hero-content text-center mb-8">
        <h2 className="text-2xl md:text-3xl mb-2">Helping Others</h2>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Live & Travel</h1>
        <p className="text-lg md:text-xl">
          Ember Special offers to suit your travel comforts
        </p>
      </div>

      {/* Route Container */}
        <div className="route-container px-4 md:px-8">
          <div className="w-full bg-white rounded-lg shadow-lg">
          {/* Filter Buttons */}
            <div className="flex justify-center gap-4 p-4 border-b">
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                selectedFilter === "flights"
                    ? "bg-[#07561A] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setSelectedFilter("flights")}
            >
                <FaPlane />
                <span className="text-sm font-medium">Flights</span>
              </button>
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                selectedFilter === "stays"
                    ? "bg-[#07561A] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setSelectedFilter("stays")}
            >
                <FaTrain />
                <span className="text-sm font-medium">Trains</span>
              </button>
          </div>

          {/* Route Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
            <FromToSelector
                stations={stations}
                selectedFrom={selectedFromStation}
                selectedTo={selectedToStation}
                onFromChange={setSelectedFromStation}
                onToChange={setSelectedToStation}
            />
            <Tripselector
                value={selectedTripType}
                onChange={handleTripTypeChange}
              />
              <DateSelector 
                onDatesChange={handleDatesChange}
              />
              <PassengerClassSelector
                availableClasses={[
                  { name: "First Class", code: "FC", id: "1", baseFare: 1000, isActive: true },
                  { name: "Business Class", code: "BC", id: "2", baseFare: 800, isActive: true },
                  { name: "Standard Class", code: "SC", id: "3", baseFare: 500, isActive: true }
                ]}
                selectedClass={routeState.passengerDetails.classType}
                passengerCounts={routeState.passengerDetails}
                onClassSelect={(classType) => handlePassengerDetailsUpdate({ classType })}
                onPassengerCountChange={handlePassengerDetailsUpdate}
              />
              
              <div className="md:col-span-4 mt-4">
                <button
                  onClick={handleSearch}
                  disabled={!selectedFromStation || !selectedToStation || loading}
                  className="w-full bg-[#07561A] text-white py-3 px-4 rounded-md hover:bg-[#064a15] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Searching..." : "Search Routes"}
                </button>
                {error && (
                  <p className="text-red-500 text-center mt-2">{error}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Route Summary Section with Filters */}
      <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FaMapMarkerAlt className="text-[#07561A]" />
            Available Routes
          </h2>
          
          {/* Filter Options */}
          <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
            <select 
              className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#07561A]"
              onChange={(e) => {
                // Add filter logic here
              }}
            >
              <option value="">Filter by Region</option>
              <option value="north">Northern Routes</option>
              <option value="south">Southern Routes</option>
              <option value="east">Eastern Routes</option>
              <option value="west">Western Routes</option>
            </select>
            
            <select 
              className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#07561A]"
              onChange={(e) => {
                // Add duration filter logic here
              }}
            >
              <option value="">Journey Duration</option>
              <option value="short">Short (≤ 3 hours)</option>
              <option value="medium">Medium (4-6 hours)</option>
              <option value="long">Long (&gt; 6 hours)</option>
            </select>
          </div>
        </div>
        
        {loadingSummary ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#07561A]"></div>
          </div>
        ) : routeSummaries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routeSummaries.map((summary) => summary && summary.route && (
              <div key={summary._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                {/* Route Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {summary.fromStation.name} → {summary.toStation.name}
                    </h3>
                    <p className="text-gray-600 text-sm flex items-center gap-2">
                      <FaRoute className="text-[#07561A]" />
                      {summary.route.distance} km • {summary.route.estimatedDuration}
                    </p>
                  </div>
                </div>

                {/* Route Details */}
                <div className="space-y-3 bg-gray-50 p-3 rounded-md mb-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <FaClock className="text-[#07561A]" />
                      <span>{summary.departureTime} - {summary.arrivalTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaTicketAlt className="text-[#07561A]" />
                      <span>From ₦{summary.route.baseFare.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  {/* Available Classes */}
                  <div className="text-sm">
                    <div className="font-medium mb-1">Available Classes:</div>
                    <div className="grid grid-cols-3 gap-2">
                      {summary.route.availableClasses.map((cls, idx) => (
                        <div key={idx} className="bg-white px-2 py-1 rounded text-center">
                          {cls.code} - ₦{cls.baseFare}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Seat Availability */}
                  {summary.availableSeats && (
                  <div className="text-sm">
                    <div className="font-medium mb-1">Available Seats:</div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div>FC: {summary.availableSeats?.FC || 0}</div>
                        <div>BC: {summary.availableSeats?.BC || 0}</div>
                        <div>SC: {summary.availableSeats?.SC || 0}</div>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleViewTimetable(summary)}
                  className="w-full bg-[#07561A] text-white py-2 px-4 rounded hover:bg-[#064a15] transition-colors"
                >
                  View Schedule
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600 py-8">
            No routes available. Please try different search criteria.
          </div>
        )}
      </div>

      <div className="mt-6 space-y-6">
        {routes.length > 0 && (
          <div className="space-y-4 mt-6">
            <h2 className="text-xl font-semibold">Available Routes</h2>
            {routeSummaries.map((route: DisplayRoute) => (
              <div key={route._id} className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">
                      {route.fromStation.name} ({route.fromStation.code}) → {route.toStation.name} ({route.toStation.code})
                    </p>
                    <p className="text-gray-600">
                      Distance: {route.distance}km • Duration: {route.estimatedDuration}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">Base Fare: ₦{route.baseFare}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleViewTimetable(route)}
                  className="w-full bg-[#07561A] text-white py-2 px-4 rounded hover:bg-[#064a15] transition-colors"
                >
                  View Train Timetable
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

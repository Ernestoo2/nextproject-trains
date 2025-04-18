"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaTrain} from "react-icons/fa";
import { useRouter } from "next/navigation";
import FromToSelector from "./_components/rout-selectors/FromToSelector";
import Tripselector from "./_components/rout-selectors/Tripselector";
import DateSelector from "./_components/rout-selectors/DateSelector";
import PassengerClassSelector from "./_components/rout-selectors/PassengerClassSelector";
import { TRIP_TYPES } from "@/(dashboard)/trains/train-search/_constants/train.constants";  

import { 
  StationType, 
  TrainClass, 
  Route, 
  PassengerDetails, 
  RouteState, 
} from "@/types/route.types";
import { TripType  } from "./_type";

export default function RoutePage() {
  const router = useRouter();
  const [stations, setStations] = useState<StationType []>([]);
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

  const [selectedFromStationId, setSelectedFromStationId] = useState<string>("");
  const [selectedToStationId, setSelectedToStationId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedFrom, setSelectedFrom] = useState<StationType | null>(null);
  const [selectedTo, setSelectedTo] = useState<StationType | null>(null); 
  const [dates, setDates] = useState({
    departure: new Date().toISOString().split('T')[0],
    return: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const [trainClasses, setTrainClasses] = useState<TrainClass[]>([]);

  const [availableRoutes, setAvailableRoutes] = useState<Route[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);

  const fetchStations = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/stations");
      if (!response.ok) throw new Error('Failed to fetch stations');
      const data = await response.json();
      if (data.success && data.data) {
        setStations(data.data);
      } else {
        throw new Error(data.message || 'Failed to load stations');
      }
    } catch (err) {
      console.error("Error fetching stations:", err);
      setError(err instanceof Error ? err.message : "Failed to load stations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  const handleFromSelect = (stationId: string) => {
    setSelectedFromStationId(stationId);
    const station = stations.find(s => s.id === stationId);
    setSelectedFrom(station || null);
    if (stationId === selectedToStationId) {
      setSelectedToStationId("");
      setSelectedTo(null);
    }
  };

  const handleToSelect = (stationId: string) => {
    setSelectedToStationId(stationId);
    const station = stations.find(s => s.id === stationId);
    setSelectedTo(station || null);
    if (stationId === selectedFromStationId) {
      setSelectedFromStationId("");
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

  const handleViewTimetable = () => {
    if (!selectedFromStationId || !selectedToStationId) {
      setError("Please select both departure and arrival stations.");
      return;
    }
    setError("");

    const searchParams = new URLSearchParams({
      fromStationId: selectedFromStationId,
      toStationId: selectedToStationId,
      date: dates.departure,
      classType: routeState.passengerDetails.classType,
      adultCount: routeState.passengerDetails.adultCount.toString(),
      childCount: routeState.passengerDetails.childCount.toString(),
      infantCount: routeState.passengerDetails.infantCount.toString()
    });

    if (selectedTripType === TRIP_TYPES.ROUND_TRIP) {
      searchParams.append('returnDate', dates.return);
    }

    router.push(`/trains/train-search?${searchParams.toString()}`);
  };

  useEffect(() => {
    const fetchTrainClasses = async () => {
      try {
        const response = await fetch('/api/train-classes');
        if (!response.ok) throw new Error('Failed to fetch train classes');
        const data = await response.json();
        if (data.success && data.trainClasses) {
          const mappedClasses = data.trainClasses.map((cls: any) => ({
            _id: cls._id,
            name: cls.name,
            code: cls.code,
            baseFare: cls.baseFare,
            isActive: cls.isActive,
          }));
          setTrainClasses(mappedClasses);
          if (mappedClasses.length > 0 && !routeState.passengerDetails.classType) {
            handlePassengerDetailsUpdate({ classType: mappedClasses[0].code });
          }
        }
      } catch (error) {
        console.error("Error fetching train classes:", error);
        // Fallback train classes
        const fallbackClasses: TrainClass[] = [
          { _id: "1", name: "First Class AC", code: "1A", baseFare: 2000, isActive: true } as TrainClass,
          { _id: "2", name: "Second Class AC", code: "2A", baseFare: 1500, isActive: true } as TrainClass,
          { _id: "3", name: "Third Class AC", code: "3A", baseFare: 1000, isActive: true } as TrainClass,
          { _id: "4", name: "Sleeper Class", code: "SL", baseFare: 500, isActive: true } as TrainClass,
        ];
        setTrainClasses(fallbackClasses);
        handlePassengerDetailsUpdate({ classType: 'SL' });
      }
    };
    fetchTrainClasses();
  }, []);

  const fetchAvailableRoutes = useCallback(async () => {
    if (!selectedFromStationId || !selectedToStationId) {
      setAvailableRoutes([]);
      return;
    }

    setLoadingRoutes(true);
    try {
      const response = await fetch(
        `/api/routes/search?fromStationId=${selectedFromStationId}&toStationId=${selectedToStationId}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch routes');
      
      const data = await response.json();
      if (data.success) {
        setAvailableRoutes(data.data);
      }
    } catch (err) {
      console.error("Error fetching routes:", err);
      setError(err instanceof Error ? err.message : "Failed to load routes");
    } finally {
      setLoadingRoutes(false);
    }
  }, [selectedFromStationId, selectedToStationId]);

  useEffect(() => {
    fetchAvailableRoutes();
  }, [fetchAvailableRoutes]);

  return (
    <div className="min-h-screen bg-[#F3F3F3] pb-12">
      <div className="bg-container mb-12 md:mb-16">
        <div className="hero-content text-center mb-8">
          <h2 className="text-2xl md:text-3xl mb-2 text-gray-700">Helping Others</h2>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Live & Travel</h1>
          <p className="text-lg md:text-xl text-gray-600">
          Ember Special offers to suit your travel comforts
        </p>
      </div>

        <div className="route-container px-4 md:px-8 max-w-5xl mx-auto">
          <div className="w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-center mb-6">
              <button
                className={`flex items-center gap-2 px-6 py-3 rounded-full transition-colors bg-[#07561A] text-white`}
            >
                <FaTrain />
                <span className="text-sm font-medium">Trains</span>
              </button>
          </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div className="lg:col-span-1">
            <FromToSelector
                stations={stations}
                selectedFrom={selectedFromStationId}
                selectedTo={selectedToStationId}
                onFromChange={handleFromSelect}
                onToChange={handleToSelect}
                date={dates.departure}
                classType={routeState.passengerDetails.classType}
              />
              </div>
              <div className="lg:col-span-1">
            <Tripselector
                value={selectedTripType}
                onChange={handleTripTypeChange}
              />
              </div>
              <div className="lg:col-span-1">
              <DateSelector 
                  onDatesChange={(date) => handleDatesChange(date, date)}
                  defaultDate={dates.departure}
              />
              </div>
              <div className="lg:col-span-1">
              <PassengerClassSelector
                  availableClasses={trainClasses}
                selectedClass={routeState.passengerDetails.classType}
                passengerCounts={routeState.passengerDetails}
                onClassSelect={(classType) => handlePassengerDetailsUpdate({ classType })}
                onPassengerCountChange={handlePassengerDetailsUpdate}
              />
              </div>
              
              <div className="lg:col-span-1 flex items-end">
                <button
                  onClick={handleViewTimetable}
                  disabled={loading || !selectedFromStationId || !selectedToStationId}
                  className="w-full bg-[#07561A] text-white rounded-md py-3 px-6 text-sm font-medium hover:bg-[#064a15] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Searching..." : "Search Trains"}
                </button>
              </div>
            </div>
            
            {error && (
              <p className="text-red-500 text-center mt-4">{error}</p>
            )}

            {/* Available Routes Section */}
            {selectedFromStationId && selectedToStationId && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Available Routes</h3>
                
                {loadingRoutes ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
                  </div>
                ) : availableRoutes.length > 0 ? (
                  <div className="grid gap-4">
                    {availableRoutes.map((route) => (
                      <div
                        key={route._id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">
                              {selectedFrom?.name} ({selectedFrom?.code}) → {selectedTo?.name} ({selectedTo?.code})
                            </h4>
                            <p className="text-sm text-gray-600">
                              Distance: {route.distance}km • Duration: {route.estimatedDuration}
                            </p>
                </div>
                          <div className="text-right">
                            <p className="font-medium">₦{route.baseFare}</p>
                            <p className="text-sm text-gray-600">Base Fare</p>
                    </div>
                  </div>
                  
                        <div className="mt-4">
                          <h5 className="text-sm font-medium mb-2">Available Classes:</h5>
                          <div className="flex flex-wrap gap-2">
                            {route.availableClasses.map((cls) => (
                              <span
                                key={cls._id}
                                className="px-2 py-1 bg-gray-100 rounded text-sm"
                              >
                                {cls.name}
                              </span>
                      ))}
                    </div>
                </div>

                <button
                          onClick={() => handleViewTimetable()}
                          className="mt-4 w-full bg-[#07561A] text-white py-2 px-4 rounded-md hover:bg-[#064a15] transition-colors"
                >
                  View Schedule
                </button>
              </div>
            ))}
          </div>
        ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No routes found between these stations</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

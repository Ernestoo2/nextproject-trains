"use client";
import DateSelector from "./_components/rout-selectors/DateSelector";
import FromToSelector from "./_components/rout-selectors/FromToSelector";
import PassengerClassSelector from "./_components/rout-selectors/PassengerClassSelector";
import React, { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaTrain } from "react-icons/fa";
import { TripType } from "@/types/shared/trains"; 
import { Route, TrainClass, RouteState, SearchParams, Station, PassengerDetails, ScheduleWithDetails, TRIP_TYPES } from "@/types/shared/trains";
import type { Route as RouteType } from "@/types/shared/trains";
import TripSelector from "./_components/rout-selectors/TripSelector";
import { useBookingStore } from "@/store/bookingStore";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function RoutePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedTripType, setSelectedTripType] = useState<TripType>(
    TRIP_TYPES.ONE_WAY,
  );
  const [routeState, setRouteState] = useState<RouteState>({
    selectedRoute: null,
    selectedTrip: null,
    passengerDetails: {
      classType: "SC",
      adultCount: 1,
      childCount: 0,
      infantCount: 0,
    },
    bookingStage: "ROUTE_SELECTION",
  });

  const [selectedFromStationId, setSelectedFromStationId] = useState<string>("");
  const [selectedToStationId, setSelectedToStationId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedFrom, setSelectedFrom] = useState<Station | null>(null);
  const [selectedTo, setSelectedTo] = useState<Station | null>(null);
  const [dates, setDates] = useState({
    departure: new Date().toISOString().split("T")[0],
    return: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
  });

  const [trainClasses, setTrainClasses] = useState<TrainClass[]>([]);
  const [availableRoutes, setAvailableRoutes] = useState<RouteType[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [routeSchedules, setRouteSchedules] = useState<Record<string, ScheduleWithDetails[]>>({});
  const [loadingSchedules, setLoadingSchedules] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchStations = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/stations");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || "Failed to load stations");
        }

        const stationsData = data.data?.stations || [];
        if (!Array.isArray(stationsData)) {
          throw new Error("Invalid stations data format");
        }

        // Validate and transform station data
        const validStations = stationsData
          .filter(station => {
            // Ensure required fields are present and valid
            return (
              station &&
              typeof station._id === 'string' &&
              typeof station.stationName === 'string' &&
              typeof station.stationCode === 'string' &&
              typeof station.city === 'string' &&
              typeof station.state === 'string' &&
              typeof station.region === 'string' &&
              typeof station.address === 'string'
            );
          })
          .map(station => ({
            ...station,
            facilities: Array.isArray(station.facilities) ? station.facilities : [],
            platforms: typeof station.platforms === 'number' ? station.platforms : 1,
            isActive: station.isActive !== false
          }));

        setStations(validStations);
      } catch (err) {
        console.error("Error fetching stations:", err);
        setError(err instanceof Error ? err.message : "Failed to load stations");
        setStations([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchTrainClasses = async () => {
      try {
        const response = await fetch("/api/train-classes");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Handle both response formats (array or object with data property)
        const classesData = Array.isArray(data) ? data : (data.data?.classes || []);
        if (!Array.isArray(classesData)) {
          throw new Error("Invalid train classes data format");
        }

        // Validate and transform train class data
        const validClasses = classesData
          .filter(cls => {
            return (
              cls &&
              (typeof cls._id === 'string' || typeof cls.code === 'string') &&
              (typeof cls.name === 'string' || typeof cls.className === 'string') &&
              (typeof cls.basePrice === 'number' || typeof cls.baseFare === 'number') &&
              typeof cls.isActive === 'boolean'
            );
          })
          .map(cls => ({
            _id: cls._id?.toString() || cls.code,
            className: cls.name || cls.className,
            classCode: cls.code || cls.classCode,
            classType: cls.classType || (cls.isActive ? "AC" : "NON_AC"),
            basePrice: cls.basePrice || cls.baseFare,
            isActive: cls.isActive,
          }));

        setTrainClasses(validClasses);
        
        // Set default class if none selected
        if (validClasses.length > 0 && !routeState.passengerDetails.classType) {
          handlePassengerDetailsUpdate({ classType: validClasses[0].classCode });
        }
      } catch (error) {
        console.error("Error fetching train classes:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch train classes");
        setTrainClasses([]);
      }
    };

    fetchStations();
    fetchTrainClasses();
  }, []);

  useEffect(() => {
    const params: Partial<SearchParams> = {
      fromStationId: searchParams.get("fromStationId") || "",
      toStationId: searchParams.get("toStationId") || "",
      date: searchParams.get("date") || "",
      classType: searchParams.get("classType") || "",
    };

    setRouteState(prev => ({
      ...prev,
      passengerDetails: {
        ...prev.passengerDetails,
        classType: params.classType || prev.passengerDetails.classType
      }
    }));
  }, [searchParams]);

  const handleFromSelect = (stationId: string) => {
    setSelectedFromStationId(stationId);
    const station = stations.find((s) => s._id === stationId);
    setSelectedFrom(station || null);
    if (stationId === selectedToStationId) {
      setSelectedToStationId("");
      setSelectedTo(null);
    }
  };

  const handleToSelect = (stationId: string) => {
    setSelectedToStationId(stationId);
    const station = stations.find((s) => s._id === stationId);
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
        ...details,
      },
    }));
  };

  const handleDatesChange = (departureDate: string, returnD: string) => {
    setDates({
      departure: departureDate,
      return: selectedTripType === TRIP_TYPES.ROUND_TRIP ? returnD : departureDate,
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
      infantCount: routeState.passengerDetails.infantCount.toString(),
      tripType: selectedTripType
    });

    if (selectedTripType === TRIP_TYPES.ROUND_TRIP) {
      searchParams.append("returnDate", dates.return);
    }

    router.push(`/trains/train-timetable?${searchParams.toString()}`);
  };

  // Function to fetch schedules for a route
  const fetchSchedulesForRoute = useCallback(async (route: RouteType) => {
    try {
      setLoadingSchedules(prev => ({ ...prev, [route._id]: true }));

      const params = new URLSearchParams({
        fromStationId: route.fromStation._id,
        toStationId: route.toStation._id,
        date: dates.departure,
        classType: routeState.passengerDetails.classType,
        adultCount: routeState.passengerDetails.adultCount.toString(),
        childCount: routeState.passengerDetails.childCount.toString(),
        infantCount: routeState.passengerDetails.infantCount.toString(),
        tripType: selectedTripType
      });

   
      const response = await fetch(`/api/schedules/search?${params}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch schedules");
      }

      setRouteSchedules(prev => ({
        ...prev,
        [route._id]: data.data
      }));
    } catch (error) {
      console.error(`Error fetching schedules for route ${route._id}:`, error);
    } finally {
      setLoadingSchedules(prev => ({ ...prev, [route._id]: false }));
    }
  }, [dates.departure, routeState.passengerDetails, selectedTripType]);

  const fetchAvailableRoutes = useCallback(async () => {
    if (!selectedFromStationId || !selectedToStationId) {
      setAvailableRoutes([]);
      setRouteSchedules({});
      return;
    }

    setLoadingRoutes(true);
    try {
      
      const response = await fetch(
        `/api/routes/search?fromStationId=${selectedFromStationId}&toStationId=${selectedToStationId}`
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch routes");
      }

    
      const transformedRoutes = data.data.map((route: any) => ({ 
        _id: route._id.toString(),
        fromStation: {
          _id: route.fromStation._id.toString(),
          stationName: route.fromStation.stationName || route.fromStation.name,
          stationCode: route.fromStation.stationCode || route.fromStation.code,
          city: route.fromStation.city,
          state: route.fromStation.state,
          region: route.fromStation.region || "",
          address: route.fromStation.address || "",
          facilities: route.fromStation.facilities || [],
          platforms: route.fromStation.platforms || 1,
          isActive: route.fromStation.isActive,
          createdAt: route.fromStation.createdAt || new Date().toISOString(),
          updatedAt: route.fromStation.updatedAt || new Date().toISOString()
        },
        toStation: {
          _id: route.toStation._id.toString(),
          stationName: route.toStation.stationName || route.toStation.name,
          stationCode: route.toStation.stationCode || route.toStation.code,
          city: route.toStation.city,
          state: route.toStation.state,
          region: route.toStation.region || "",
          address: route.toStation.address || "",
          facilities: route.toStation.facilities || [],
          platforms: route.toStation.platforms || 1,
          isActive: route.toStation.isActive,
          createdAt: route.toStation.createdAt || new Date().toISOString(),
          updatedAt: route.toStation.updatedAt || new Date().toISOString()
        },
        distance: route.distance,
        baseFare: route.baseFare,
        estimatedDuration: route.estimatedDuration,
        availableClasses: route.availableClasses,
        isActive: route.isActive
      }));

      
      setAvailableRoutes(transformedRoutes);

      // Fetch schedules for each route
      transformedRoutes.forEach((route: Route) => {
        fetchSchedulesForRoute(route);
      });

    } catch (err) {
      console.error("Error fetching routes:", err);
      setError(err instanceof Error ? err.message : "Failed to load routes");
      setAvailableRoutes([]);
      setRouteSchedules({});
    } finally {
      setLoadingRoutes(false);
    }
  }, [selectedFromStationId, selectedToStationId, fetchSchedulesForRoute]);

  useEffect(() => {
    fetchAvailableRoutes();
  }, [fetchAvailableRoutes]);

  useEffect(() => {
    if (routeState.passengerDetails.classType) {
      // Your existing effect code
    }
  }, [routeState.passengerDetails.classType]);

  return (
    <div className="min-h-screen bg-[#F3F3F3] pb-12">
      <div className="bg-container mb-12 md:mb-16">
        <div className="hero-content text-center mb-8">
          <h2 className="text-2xl md:text-3xl mb-2 text-gray-700">
            Helping Others
          </h2>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Live & Travel
          </h1>
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
                <TripSelector
                  value={selectedTripType}
                  onChange={handleTripTypeChange}
                />
              </div>
              <div className="lg:col-span-1">
                <DateSelector
                  initialDate={dates.departure}
                  onDateChange={(newDepartureDate) => handleDatesChange(newDepartureDate, dates.return)}
                />
              </div>
              <div className="lg:col-span-1">
                <PassengerClassSelector
                  availableClasses={trainClasses}
                  selectedClass={routeState.passengerDetails.classType}
                  passengerCounts={routeState.passengerDetails}
                  onClassSelect={(classType) =>
                    handlePassengerDetailsUpdate({ classType })
                  }
                  onPassengerCountChange={handlePassengerDetailsUpdate}
                />
              </div>

              <div className="lg:col-span-1 flex items-end">
                <button
                  onClick={handleViewTimetable}
                  disabled={
                    loading || !selectedFromStationId || !selectedToStationId
                  }
                  className="w-full bg-[#07561A] text-white rounded-md py-3 px-6 text-sm font-medium hover:bg-[#064a15] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Searching..." : "Search Trains"}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-center mt-4">{error}</p>}

            {/* Available Routes Section */}
            {selectedFromStationId && selectedToStationId && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Available Routes & Schedules</h3>

                {loadingRoutes ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
                  </div>
                ) : availableRoutes.length > 0 ? (
                  <div className="grid gap-6">
                    {availableRoutes.map((route) => (
                      <div key={route._id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-medium">
                              {route.fromStation.stationName} ({route.fromStation.stationCode}) →{" "}
                              {route.toStation.stationName} ({route.toStation.stationCode})
                            </h4>
                            <p className="text-sm text-gray-600">
                              Distance: {route.distance}km • Duration: {route.estimatedDuration}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">From ₦{route.baseFare}</p>
                            <p className="text-sm text-gray-600">Base Fare</p>
                          </div>
                        </div>

                        {/* Schedules Section */}
                        <div className="mt-4 border-t pt-4">
                          <h5 className="text-sm font-medium mb-3">Available Schedules:</h5>
                          {loadingSchedules[route._id] ? (
                            <div className="flex justify-center py-4">
                              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-600"></div>
                            </div>
                          ) : routeSchedules[route._id]?.length > 0 ? (
                            <div className="grid gap-3">
                              {routeSchedules[route._id].map((schedule) => (
                                <div 
                                  key={schedule._id}
                                  className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
                                >
                                  <div>
                                    <p className="font-medium">{schedule.trainName} ({schedule.trainNumber})</p>
                                    <div className="flex items-center gap-2 text-sm">
                                      <span className="text-gray-700">{schedule.departureTime}</span>
                                      <span className="text-gray-400">→</span>
                                      <span className="text-gray-700">{schedule.arrivalTime}</span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                                      schedule.status === "SCHEDULED" ? "bg-green-100 text-green-800" :
                                      schedule.status === "DELAYED" ? "bg-yellow-100 text-yellow-800" :
                                      "bg-red-100 text-red-800"
                                    }`}>
                                      {schedule.status}
                              </span>
                                    {schedule.availableClasses
                                      .filter(cls => cls.code === routeState.passengerDetails.classType)
                                      .map(cls => (
                                        <p key={cls.code} className="text-sm mt-1">
                                          {cls.availableSeats} seats at ₦{cls.fare}
                                        </p>
                                      ))
                                    }
                                  </div>
                                </div>
                            ))}
                          </div>
                          ) : (
                            <p className="text-center text-gray-500 py-4">
                              No schedules available for this route on selected date
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => handleViewTimetable()}
                          className="mt-4 w-full bg-[#07561A] text-white py-2 px-4 rounded-md hover:bg-[#064a15] transition-colors"
                        >
                          View Full Schedule
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">
                      No routes found between these stations
                    </p>
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

"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import StationCombobox from "./_components/StationCombobox";
import train from "../../../../public/Assets/Train1.png";
import { useRouter, useSearchParams } from "next/navigation";
import type { Station, TripType, TrainClassType } from "@/types/shared/trains";

const TRIP_TYPES = {
  ONE_WAY: "One Way",
  ROUND_TRIP: "Round Trip",
} as const;

interface SearchFormState {
  departureStation: Station | null;
  arrivalStation: Station | null;
  date: string;
  tripType: TripType;
  classType: TrainClassType;
  adultCount: number;
  childCount: number;
  infantCount: number;
}

export default function BookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [stations, setStations] = useState<Station[]>([]);
  const [loadingStations, setLoadingStations] = useState(true);
  const [stationError, setStationError] = useState<string | null>(null);

  const [formState, setFormState] = useState<SearchFormState>({
    departureStation: null,
    arrivalStation: null,
    date: new Date().toISOString().split("T")[0],
    tripType: "ONE_WAY",
    classType: "ECONOMY" as TrainClassType,
    adultCount: 1,
    childCount: 0,
    infantCount: 0,
  });

  useEffect(() => {
    const fetchStationsFromAPI = async () => {
      setLoadingStations(true);
      setStationError(null);
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
        const validStations = stationsData.filter(s => s && s._id && s.stationName);
        setStations(validStations);
      } catch (err) {
        console.error("Error fetching stations for booking interface:", err);
        setStationError(err instanceof Error ? err.message : "Failed to load stations");
        setStations([]);
      } finally {
        setLoadingStations(false);
      }
    };
    fetchStationsFromAPI();
  }, []);

  useEffect(() => {
    if (loadingStations || stations.length === 0) return;

    const fromStationId = searchParams?.get("fromStationId");
    const toStationId = searchParams?.get("toStationId");
    const dateParam = searchParams?.get("date");
    const classTypeParam = searchParams?.get("classType") as TrainClassType | null;
    const adultCountParam = searchParams?.get("adultCount");
    const childCountParam = searchParams?.get("childCount");
    const infantCountParam = searchParams?.get("infantCount");
    const tripTypeParam = searchParams?.get("tripType") as TripType | null;

    setFormState(prev => {
      const newState: SearchFormState = { ...prev };
      let changed = false;

    if (fromStationId) {
        const station = stations.find((s) => s._id === fromStationId);
        if (station && prev.departureStation?._id !== station._id) {
          newState.departureStation = station;
          changed = true;
      }
    }
    if (toStationId) {
        const station = stations.find((s) => s._id === toStationId);
        if (station && prev.arrivalStation?._id !== station._id) {
          newState.arrivalStation = station;
          changed = true;
        }
      }
      if (dateParam && prev.date !== dateParam) { newState.date = dateParam; changed = true; }
      if (classTypeParam && prev.classType !== classTypeParam) { newState.classType = classTypeParam; changed = true; }
      if (tripTypeParam && prev.tripType !== tripTypeParam) { newState.tripType = tripTypeParam; changed = true; }
      if (adultCountParam && prev.adultCount !== parseInt(adultCountParam)) { newState.adultCount = parseInt(adultCountParam); changed = true;}
      if (childCountParam && prev.childCount !== parseInt(childCountParam)) { newState.childCount = parseInt(childCountParam); changed = true;}
      if (infantCountParam && prev.infantCount !== parseInt(infantCountParam)) { newState.infantCount = parseInt(infantCountParam); changed = true;}
      
      return changed ? newState : prev;
    });

  }, [searchParams, stations, loadingStations]);

  const handleSearch = () => {
    const { departureStation, arrivalStation, date, tripType, classType, adultCount, childCount, infantCount } = formState;

    if (!departureStation || !arrivalStation) {
      alert("Please select both departure and arrival stations");
      return;
    }

    const queryStringParams: Record<string, string> = {
      fromStationId: departureStation._id,
      toStationId: arrivalStation._id,
      date,
      classType: classType as string,
      adultCount: adultCount.toString(),
      childCount: childCount.toString(),
      infantCount: infantCount.toString(),
      tripType: tripType,
    };

    const queryString = new URLSearchParams(queryStringParams).toString();
    router.push(`/trains/train-timetable?${queryString}`);
  };

  return (
    <div className="flex flex-col w-full h-auto max-w-5xl p-6 mx-auto rounded-lg shadow-md md:flex-row md:items-center md:justify-between">
      <div className="space-y-6 md:w-1/2">
        <div className="w-[163px] justify-center text-center">
          <h2 className="bg-[#07561A] text-sm text-white w-full h-auto rounded-lg py-1 mx-auto">
            Hello Travellers
          </h2>
        </div>

        <h1 className="text-4xl font-bold text-[#2D3748]">
          Make your booking experience easy!
        </h1>
        <p className="text-[#4A5568]">
          Train booking is a process of choosing and purchasing train seats
          online. It is an easy process but we are here to make it much better &
          simple.
        </p>

        <div className="grid items-center justify-center grid-cols-1 gap-5">
          <StationCombobox
            stations={stations}
            selected={formState.departureStation}
            onChange={(station) =>
              setFormState((prev) => ({ ...prev, departureStation: station }))
            }
            label="Departure"
            placeholder={loadingStations ? "Loading stations..." : "Select departure station"}
          />
          <StationCombobox
            stations={stations.filter(
              (s) => s._id !== formState.departureStation?._id,
            )}
            selected={formState.arrivalStation}
            onChange={(station) =>
              setFormState((prev) => ({ ...prev, arrivalStation: station }))
            }
            label="Arrival"
            placeholder={loadingStations ? "Loading stations..." : "Select arrival station"}
          />
          <div>
            <label htmlFor="date" className="block text-[#4A5568] font-medium">
              Date
            </label>
            <input
              type="date"
              id="date"
              value={formState.date}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, date: e.target.value }))
              }
              min={new Date().toISOString().split("T")[0]}
              className="w-full text-gray-500 border-t-0 border-b-2 border-x-0 focus:outline-none focus:border-green-600"
            />
          </div>
          <div>
            <label
              htmlFor="tripType"
              className="block text-[#4A5568] font-medium"
            >
              Trip Type
            </label>
            <select
              id="tripType"
              value={formState.tripType}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  tripType: e.target.value as TripType,
                }))
              }
              className="w-full text-gray-500 border-t-0 border-b-2 border-x-0 focus:outline-none focus:border-green-600"
            >
              {Object.entries(TRIP_TYPES).map(([key, value]) => (
                <option key={key} value={key as TripType}>
                  {String(value)} 
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center w-full mx-auto text-center">
          <button
            onClick={handleSearch}
            className="w-full px-6 py-3 text-white transition bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!formState.departureStation || !formState.arrivalStation}
          >
            Search for trains
          </button>
        </div>
      </div>

      <div className="mt-6 md:mt-0 md:ml-8 md:w-1/2">
        <div className="w-full h-64 bg-gray-300 rounded-lg flex items-center justify-center">
          <Image
            src={train}
            className="w-full h-full rounded-md object-cover"
            alt="Train"
            width={500}
            height={300}
          />
        </div>
      </div>
    </div>
  );
}

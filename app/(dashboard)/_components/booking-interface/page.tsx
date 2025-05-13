"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import StationCombobox from "./_components/StationCombobox";
import train from "../../../../public/Assets/Train1.png";
import { useRouter, useSearchParams } from "next/navigation";
import { STATIONS } from "./_constants/stations";
import { BookingFormState, SearchParams } from "./_types/booking.types";
import { Station } from "./_types/station.types";
import { TRIP_TYPES } from "@/(dashboard)/trains/train-search/_constants/train.constants";
import { TripType } from "@/types/shared";

// React.FC<BookingInterfacesProps>
export default function BookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formState, setFormState] = useState<BookingFormState>({
    departureStation: null,
    arrivalStation: null,
    date: new Date().toISOString().split("T")[0],
    tripType: "ONE-WAY",
  });

  // Load initial state from URL parameters
  useEffect(() => {
    const fromStationId = searchParams?.get("fromStationId")
    const toStationId = searchParams?.get("toStationId");
    const date = searchParams?.get("date");
    const classType = searchParams?.get("classType");
    const adultCount = searchParams?.get("adultCount");
    const childCount = searchParams?.get("childCount");
    const infantCount = searchParams?.get("infantCount");

    if (fromStationId) {
      const station = STATIONS.find((s) => s.id === fromStationId);
      if (station) {
        setFormState((prev: BookingFormState) => ({ ...prev, departureStation: station.id }));
      }
    }

    if (toStationId) {
      const station = STATIONS.find((s) => s.id === toStationId);
      if (station) {
        setFormState((prev: BookingFormState) => ({ ...prev, arrivalStation: station.id }));
      }
    }
    if (date) {
      setFormState((prev) => ({ ...prev, date }));
    }
  }, [searchParams]);

  const handleSearch = () => {
    const { departureStation, arrivalStation, date, tripType } = formState;

    if (!departureStation || !arrivalStation) {
      alert("Please select both departure and arrival stations");
      return;
    }

    const queryString = new URLSearchParams({
      fromStationId: departureStation.id,
      toStationId: arrivalStation.id,
      date,
      classType: "SC", // Default class type
      adultCount: "1", // Default adult count
      childCount: "0", // Default child count
      infantCount: "0", // Default infant count
    }).toString();

    router.push(`/trains/train-search?${queryString}`);
  };

  return (
    <div className="flex flex-col w-full h-auto max-w-5xl p-6 mx-auto rounded-lg shadow-md md:flex-row md:items-center md:justify-between">
      {/* Left Side: Text and Inputs */}
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

        {/* Input Section */}
        <div className="grid items-center justify-center grid-cols-1 gap-5">
          <StationCombobox
            stations={STATIONS}
            selected={formState.departureStation }

            onChange={(station) =>
              setFormState((prev) => ({ ...prev, departureStation: station }))
            }
            label="Departure"
            placeholder="Select departure station"
          />
          <StationCombobox
            stations={STATIONS.filter(
              (station) => station.id !== formState.departureStation?.id,
            )}
            selected={formState.arrivalStation}
            onChange={(station) =>
              setFormState((prev) => ({ ...prev, arrivalStation: station }))
            }
            label="Arrival"
            placeholder="Select arrival station"
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
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Button */}
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

      {/* Right Side: Image */}
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

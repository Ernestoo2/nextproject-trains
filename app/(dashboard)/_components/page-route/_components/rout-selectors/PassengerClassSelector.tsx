import React, { useState } from "react";
import { FaUser } from "react-icons/fa6";
import { TrainClass, PassengerDetails } from "@/types/route.types";

interface PassengerClassSelectorProps {
  availableClasses: TrainClass[];
  selectedClass: string;
  passengerCounts: PassengerDetails;
  onClassSelect: (classType: string) => void;
  onPassengerCountChange: (details: Partial<PassengerDetails>) => void;
  maxPassengersPerBooking?: number;
}

export default function PassengerClassSelector({
  availableClasses,
  selectedClass,
  passengerCounts,
  onClassSelect,
  onPassengerCountChange,
  maxPassengersPerBooking = 6
}: PassengerClassSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const totalPassengers =
    passengerCounts.adultCount +
    passengerCounts.childCount +
    passengerCounts.infantCount;

  const handlePassengerChange = (type: keyof PassengerDetails, value: number | string) => {
    if (type === "classType") {
      onClassSelect(value as string);
      return;
    }

    const newCount = Math.max(
      type === "adultCount" ? 1 : 0, // Ensure at least 1 adult, 0 for others
      Math.min(value as number, maxPassengersPerBooking - (totalPassengers - passengerCounts[type as keyof Omit<PassengerDetails, 'classType'>])) // Ensure total doesn't exceed max
    );

    // Prevent infants > adults
    if (type === "infantCount" && (newCount as number) > passengerCounts.adultCount) {
      return;
    }
    // Prevent reducing adults below infants
    if (type === "adultCount" && (newCount as number) < passengerCounts.infantCount) {
        return;
    }

    // Prevent reducing adults below 1
    if (type === "adultCount" && (newCount as number) < 1) {
        return;
    }

    // Calculate potential new total passengers
    const potentialTotal = type === 'adultCount' ? (newCount as number) + passengerCounts.childCount + passengerCounts.infantCount :
                         type === 'childCount' ? passengerCounts.adultCount + (newCount as number) + passengerCounts.infantCount :
                         passengerCounts.adultCount + passengerCounts.childCount + (newCount as number);

    if (potentialTotal > maxPassengersPerBooking) {
      return; // Don't update if it exceeds the maximum
    }

    onPassengerCountChange({
      [type]: newCount
    });
  };

  return (
    <div className="relative">
      <div className="border border-[#79747E] p-3 rounded-md flex items-center gap-3 text-sm cursor-pointer"
           onClick={() => setIsOpen(!isOpen)}>
        <span className="absolute -top-2 left-3 bg-white px-1 text-xs text-[#79747E]">
          Passengers & Class
      </span>
        <FaUser className="text-[#79747E]" />
        <span>
          {totalPassengers} Passenger{totalPassengers !== 1 ? "s" : ""} •{" "}
          {selectedClass}
        </span>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 p-4">
          {/* Class Selection */}
            <div className="mb-4">
            <p className="text-sm font-medium mb-2">Travel Class</p>
            <div className="grid grid-cols-3 gap-2">
              {availableClasses.map((classOption) => (
                <button
                  key={classOption.code}
                  onClick={() => handlePassengerChange("classType", classOption.code)}
                  className={`text-center px-2 py-2 rounded-md border transition-colors text-xs ${ // Adjusted padding and text size
                    selectedClass === classOption.code
                      ? "bg-[#07561A] text-white border-[#07561A]"
                      : "border-gray-300 hover:border-[#07561A]"
                  }`}
                >
                  {classOption.name}
                </button>
              ))}
            </div>
          </div>

          {/* Passenger Counts */}
          <div className="space-y-4">
            {/* Adults */}
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Adults</p>
                <p className="text-sm text-gray-500">Age 12+</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    handlePassengerChange("adultCount", passengerCounts.adultCount - 1)
                  }
                  className="w-8 h-8 rounded-full border border-[#07561A] text-[#07561A] disabled:opacity-50 flex items-center justify-center"
                  disabled={passengerCounts.adultCount <= 1 || passengerCounts.adultCount <= passengerCounts.infantCount}
                >
                  -
                </button>
                <span>{passengerCounts.adultCount}</span>
                <button
                  onClick={() =>
                    handlePassengerChange("adultCount", passengerCounts.adultCount + 1)
                  }
                  className="w-8 h-8 rounded-full border border-[#07561A] text-[#07561A] disabled:opacity-50 flex items-center justify-center"
                  disabled={totalPassengers >= maxPassengersPerBooking}
                >
                  +
                </button>
              </div>
            </div>
            {/* Children */}
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Children</p>
                <p className="text-sm text-gray-500">Age 2-11</p>
              </div>
              <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                    handlePassengerChange("childCount", passengerCounts.childCount - 1)
                  }
                  className="w-8 h-8 rounded-full border border-[#07561A] text-[#07561A] disabled:opacity-50 flex items-center justify-center"
                  disabled={passengerCounts.childCount <= 0}
                      >
                        -
                      </button>
                <span>{passengerCounts.childCount}</span>
                      <button
                        onClick={() =>
                    handlePassengerChange("childCount", passengerCounts.childCount + 1)
                  }
                  className="w-8 h-8 rounded-full border border-[#07561A] text-[#07561A] disabled:opacity-50 flex items-center justify-center"
                  disabled={totalPassengers >= maxPassengersPerBooking}
                      >
                        +
                      </button>
                    </div>
            </div>
            {/* Infants */}
            <div className="flex justify-between items-center">
            <div>
                <p className="font-medium">Infants</p>
                <p className="text-sm text-gray-500">Under 2</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    handlePassengerChange("infantCount", passengerCounts.infantCount - 1)
                  }
                  className="w-8 h-8 rounded-full border border-[#07561A] text-[#07561A] disabled:opacity-50 flex items-center justify-center"
                  disabled={passengerCounts.infantCount <= 0}
                >
                  -
                </button>
                <span>{passengerCounts.infantCount}</span>
                  <button
                  onClick={() =>
                    handlePassengerChange("infantCount", passengerCounts.infantCount + 1)
                  }
                  className="w-8 h-8 rounded-full border border-[#07561A] text-[#07561A] disabled:opacity-50 flex items-center justify-center"
                  disabled={totalPassengers >= maxPassengersPerBooking || passengerCounts.infantCount >= passengerCounts.adultCount}
                >
                  +
                  </button>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full bg-[#07561A] text-white py-2 rounded-md"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

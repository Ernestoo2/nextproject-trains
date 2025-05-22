import React, { useState, useEffect, useCallback } from "react";
import { FaUser } from "react-icons/fa6";
import { TrainClass, PassengerDetails } from "@/types/shared/trains";
import { useTrainSearchStore } from '@/store/trainSearchStore';

interface PassengerClassSelectorProps {
  availableClasses: TrainClass[];
  selectedClass: string;
  passengerCounts: PassengerDetails;
  onClassSelect: (classCode: string) => void;
  onPassengerCountChange: (details: Partial<PassengerDetails>) => void;
  maxPassengersPerBooking?: number;
}

export default function PassengerClassSelector({
  availableClasses,
  selectedClass,
  passengerCounts,
  onClassSelect,
  onPassengerCountChange,
  maxPassengersPerBooking = 6,
}: PassengerClassSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    filters, 
    updateFilters, 
    setLoading, 
    setError,
    isLoading,
    error 
  } = useTrainSearchStore();

  // Sync with store on mount
  useEffect(() => {
    if (selectedClass !== filters.classType) {
      updateFilters({ classType: selectedClass });
    }
    if (passengerCounts.adultCount !== filters.adultCount ||
        passengerCounts.childCount !== filters.childCount ||
        passengerCounts.infantCount !== filters.infantCount) {
      updateFilters({
        adultCount: passengerCounts.adultCount,
        childCount: passengerCounts.childCount,
        infantCount: passengerCounts.infantCount
      });
    }
  }, [selectedClass, passengerCounts, filters, updateFilters]);

  const totalPassengers =
    passengerCounts.adultCount +
    passengerCounts.childCount +
    passengerCounts.infantCount;

  const handlePassengerChange = useCallback(async (
    type: keyof PassengerDetails,
    value: number | string,
  ) => {
    try {
      setLoading(true);
      setError(null);

      if (type === "classType") {
        onClassSelect(value as string);
        updateFilters({ classType: value as string });
        return;
      }

      const newCount = Math.max(
        type === "adultCount" ? 1 : 0, // Ensure at least 1 adult, 0 for others
        Math.min(
          value as number,
          maxPassengersPerBooking -
            (totalPassengers -
              passengerCounts[type as keyof Omit<PassengerDetails, "classType">]),
        ), // Ensure total doesn't exceed max
      );

      // Validation checks
      if (
        type === "infantCount" &&
        (newCount as number) > passengerCounts.adultCount
      ) {
        setError("Number of infants cannot exceed number of adults");
        return;
      }
      if (
        type === "adultCount" &&
        (newCount as number) < passengerCounts.infantCount
      ) {
        setError("Cannot reduce adults below number of infants");
        return;
      }
      if (type === "adultCount" && (newCount as number) < 1) {
        setError("At least one adult is required");
        return;
      }

      // Calculate potential new total passengers
      const potentialTotal =
        type === "adultCount"
          ? (newCount as number) +
            passengerCounts.childCount +
            passengerCounts.infantCount
          : type === "childCount"
            ? passengerCounts.adultCount +
              (newCount as number) +
              passengerCounts.infantCount
            : passengerCounts.adultCount +
              passengerCounts.childCount +
              (newCount as number);

      if (potentialTotal > maxPassengersPerBooking) {
        setError(`Maximum ${maxPassengersPerBooking} passengers allowed`);
        return;
      }

      onPassengerCountChange({
        [type]: newCount,
      });

      // Update store with new passenger counts
      updateFilters({
        [type]: newCount,
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update passenger count');
    } finally {
      setLoading(false);
    }
  }, [passengerCounts, totalPassengers, maxPassengersPerBooking, onClassSelect, onPassengerCountChange, updateFilters, setLoading, setError]);

  // Get the selected class details
  const selectedClassDetails = availableClasses.find(
    (cls) => cls.classCode === selectedClass
  );

  return (
    <div className="relative">
      <div
        className={`border ${error ? 'border-red-500' : 'border-[#79747E]'} p-3 rounded-md flex items-center gap-3 text-sm cursor-pointer`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`absolute -top-2 left-3 bg-white px-1 text-xs ${error ? 'text-red-500' : 'text-[#79747E]'}`}>
          Passengers & Class
        </span>
        <FaUser className={error ? 'text-red-500' : 'text-[#79747E]'} />
        <span>
          {totalPassengers} Passenger{totalPassengers !== 1 ? "s" : ""} •{" "}
          {selectedClassDetails?.className || "Select Class"}
        </span>
      </div>

      {error && (
        <p className="text-red-500 text-xs mt-1" role="alert">
          {error}
        </p>
      )}

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 p-4">
          {/* Class Selection */}
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Travel Class</p>
            <div className="grid grid-cols-1 gap-2">
              {availableClasses.map((classOption) => (
                <button
                  key={classOption.classCode}
                  onClick={() =>
                    handlePassengerChange("classType", classOption.classCode)
                  }
                  className={`text-left px-3 py-2 rounded-md border transition-colors ${
                    selectedClass === classOption.classCode
                      ? "bg-[#07561A] text-white border-[#07561A]"
                      : "border-gray-300 hover:border-[#07561A]"
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isLoading}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{classOption.className}</p>
                      <p className="text-xs text-gray-500">
                        ₦{classOption.basePrice.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {classOption.classType}
                    </div>
                  </div>
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
                    handlePassengerChange(
                      "adultCount",
                      passengerCounts.adultCount - 1,
                    )
                  }
                  className="w-8 h-8 rounded-full border border-[#07561A] text-[#07561A] disabled:opacity-50 flex items-center justify-center"
                  disabled={
                    isLoading ||
                    passengerCounts.adultCount <= 1 ||
                    passengerCounts.adultCount <= passengerCounts.infantCount
                  }
                >
                  -
                </button>
                <span>{passengerCounts.adultCount}</span>
                <button
                  onClick={() =>
                    handlePassengerChange(
                      "adultCount",
                      passengerCounts.adultCount + 1,
                    )
                  }
                  className="w-8 h-8 rounded-full border border-[#07561A] text-[#07561A] disabled:opacity-50 flex items-center justify-center"
                  disabled={isLoading || totalPassengers >= maxPassengersPerBooking}
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
                    handlePassengerChange(
                      "childCount",
                      passengerCounts.childCount - 1,
                    )
                  }
                  className="w-8 h-8 rounded-full border border-[#07561A] text-[#07561A] disabled:opacity-50 flex items-center justify-center"
                  disabled={isLoading || passengerCounts.childCount <= 0}
                >
                  -
                </button>
                <span>{passengerCounts.childCount}</span>
                <button
                  onClick={() =>
                    handlePassengerChange(
                      "childCount",
                      passengerCounts.childCount + 1,
                    )
                  }
                  className="w-8 h-8 rounded-full border border-[#07561A] text-[#07561A] disabled:opacity-50 flex items-center justify-center"
                  disabled={isLoading || totalPassengers >= maxPassengersPerBooking}
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
                    handlePassengerChange(
                      "infantCount",
                      passengerCounts.infantCount - 1,
                    )
                  }
                  className="w-8 h-8 rounded-full border border-[#07561A] text-[#07561A] disabled:opacity-50 flex items-center justify-center"
                  disabled={isLoading || passengerCounts.infantCount <= 0}
                >
                  -
                </button>
                <span>{passengerCounts.infantCount}</span>
                <button
                  onClick={() =>
                    handlePassengerChange(
                      "infantCount",
                      passengerCounts.infantCount + 1,
                    )
                  }
                  className="w-8 h-8 rounded-full border border-[#07561A] text-[#07561A] disabled:opacity-50 flex items-center justify-center"
                  disabled={
                    isLoading ||
                    totalPassengers >= maxPassengersPerBooking ||
                    passengerCounts.infantCount >= passengerCounts.adultCount
                  }
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

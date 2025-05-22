import React, { useState, useCallback, useEffect } from "react";
import { FaRoute } from "react-icons/fa";
import { useRouter } from "next/navigation"; 
import { Station } from '@/types/shared/trains';
import { useTrainSearchStore } from '@/store/trainSearchStore';

interface FromToSelectorProps {
  stations: Station[];
  selectedFrom: string;
  selectedTo: string;
  onFromChange: (stationId: string) => void;
  onToChange: (stationId: string) => void;
  date: string;
  classType: string;
  tripType?: string;
  adultCount?: number;
  childCount?: number;
  infantCount?: number;
}

export default function FromToSelector({
  stations,
  selectedFrom,
  selectedTo,
  onFromChange,
  onToChange,
  date,
  classType,
  tripType = "ONE_WAY",
  adultCount = 1,
  childCount = 0,
  infantCount = 0
}: FromToSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { 
    filters, 
    updateFilters, 
    setLoading, 
    setError,
    isLoading,
    error 
  } = useTrainSearchStore();

  // Sync with store on mount and when props change
  useEffect(() => {
    if (selectedFrom !== filters.fromStation) {
      updateFilters({ fromStation: selectedFrom });
    }
    if (selectedTo !== filters.toStation) {
      updateFilters({ toStation: selectedTo });
    }
  }, [selectedFrom, selectedTo, filters, updateFilters]);

  const selectedFromStation = stations?.find(s => s._id === selectedFrom) || null;
  const selectedToStation = stations?.find(s => s._id === selectedTo) || null;

  const handleSearch = useCallback(async () => {
    if (!selectedFrom || !selectedTo || !date) {
      setError('Please select both departure and arrival stations');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams({
        fromStationId: selectedFrom,
        toStationId: selectedTo,
        date,
        classType,
        tripType,
        adultCount: adultCount.toString(),
        childCount: childCount.toString(),
        infantCount: infantCount.toString()
      });

      // Navigate to train timetable with all parameters
      router.push(`/trains/train-timetable?${searchParams.toString()}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to search trains');
    } finally {
      setLoading(false);
    }
  }, [selectedFrom, selectedTo, date, classType, tripType, adultCount, childCount, infantCount, router, setLoading, setError]);

  const handleStationChange = useCallback((stationId: string, type: 'from' | 'to') => {
    if (type === 'from') {
      onFromChange(stationId);
      updateFilters({ fromStation: stationId });
    } else {
      onToChange(stationId);
      updateFilters({ toStation: stationId });
    }
    setIsOpen(false);
  }, [onFromChange, onToChange, updateFilters]);

  return (
    <div className="relative w-full md:col-span-2">
      <div className={`border ${error ? 'border-red-500' : 'border-[#79747E]'} p-3 rounded-md flex items-center gap-3 text-sm`}>
        <span className={`absolute -top-2 left-3 bg-white px-1 text-xs ${error ? 'text-red-500' : 'text-[#79747E]'}`}>
          From - To
        </span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full relative rounded-md flex items-center gap-3 text-sm cursor-pointer"
          aria-expanded={isOpen}
          aria-label="Select route"
          disabled={isLoading}
        >
          <span className="font-medium truncate">
            {selectedFromStation?.stationName || "Select"} - {selectedToStation?.stationName || "Select"}
          </span>
          <FaRoute className={`${error ? 'text-red-500' : 'text-[#79747E]'} ml-auto flex-shrink-0`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
            <div className="w-full p-2 md:p-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <p className="text-xs text-[#79747E] font-medium">From:</p>
                <div className="space-y-1 max-h-[40vh] overflow-y-auto">
                  {stations.map((station) => (
                    <button
                      key={station._id}
                      onClick={() => handleStationChange(station._id, 'from')}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors
                        ${selectedFrom === station._id 
                          ? "bg-[#07561A] text-white" 
                          : "hover:bg-gray-50"}
                        ${selectedTo === station._id 
                          ? "opacity-50 cursor-not-allowed" 
                          : "cursor-pointer"}`}
                      disabled={station._id === selectedTo || isLoading}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{station.stationName}</span>
                        <span className="text-xs text-gray-500">
                          {station.stationCode} • {station.city}, {station.state}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-[#79747E] font-medium">To:</p>
                <div className="space-y-1 max-h-[40vh] overflow-y-auto">
                  {stations.map((station) => (
                    <button
                      key={station._id}
                      onClick={() => handleStationChange(station._id, 'to')}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors
                        ${selectedTo === station._id 
                          ? "bg-[#07561A] text-white" 
                          : "hover:bg-gray-50"}
                        ${selectedFrom === station._id 
                          ? "opacity-50 cursor-not-allowed" 
                          : "cursor-pointer"}`}
                      disabled={station._id === selectedFrom || isLoading}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{station.stationName}</span>
                        <span className="text-xs text-gray-500">
                          {station.stationCode} • {station.city}, {station.state}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-xs mt-1" role="alert">
          {error}
        </p>
      )}

      {selectedFrom && selectedTo && (
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className={`mt-4 w-full bg-[#07561A] text-white py-2 px-4 rounded-md transition-colors
            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#064a15]'}`}
        >
          {isLoading ? 'Searching...' : 'Search Trains'}
        </button>
      )}
    </div>
  );
}
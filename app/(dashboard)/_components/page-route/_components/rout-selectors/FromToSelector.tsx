import React, { useState, useCallback } from "react";
import { FaRoute } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { StationType } from "@/types/route.types";

interface FromToSelectorProps {
  stations: StationType[];
  selectedFrom: string;
  selectedTo: string;
  onFromChange: (stationId: string) => void;
  onToChange: (stationId: string) => void;
  date: string;
  classType: string;
}

export default function FromToSelector({
  stations,
  selectedFrom,
  selectedTo,
  onFromChange,
  onToChange,
  date,
  classType,
}: FromToSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const selectedFromStation = stations.find(s => s._id === selectedFrom);
  const selectedToStation = stations.find(s => s._id === selectedTo);

  const handleSearch = useCallback(() => {
    if (!selectedFrom || !selectedTo || !date) {
      return;
    }

    const searchParams = new URLSearchParams({
      fromStationId: selectedFrom,
      toStationId: selectedTo,
      date,
      classType,
    });

    router.push(`/trains/train-search?${searchParams.toString()}`);
  }, [selectedFrom, selectedTo, date, classType, router]);

  return (
    <div className="relative w-full md:col-span-2">
      <div className="border border-[#79747E] p-3 rounded-md flex items-center gap-3 text-sm">
        <span className="absolute -top-2 left-3 bg-white px-1 text-xs text-[#79747E]">
          From - To
        </span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full relative rounded-md flex items-center gap-3 text-sm cursor-pointer"
          aria-expanded={isOpen}
          aria-label="Select route"
        >
          <span className="font-medium truncate">
            {selectedFromStation?.name || "Select"} - {selectedToStation?.name || "Select"}
          </span>
          <FaRoute className="text-[#79747E] ml-auto flex-shrink-0" />
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
                      onClick={() => {
                        onFromChange(station._id);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors
                        ${selectedFrom === station._id 
                          ? "bg-[#07561A] text-white" 
                          : "hover:bg-gray-50"}
                        ${selectedTo === station._id 
                          ? "opacity-50 cursor-not-allowed" 
                          : "cursor-pointer"}`}
                      disabled={station._id === selectedTo}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{station.name}</span>
                        <span className="text-xs text-gray-500">
                          {station.code} • {station.city}, {station.state}
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
                      onClick={() => {
                        onToChange(station._id);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors
                        ${selectedTo === station._id 
                          ? "bg-[#07561A] text-white" 
                          : "hover:bg-gray-50"}
                        ${selectedFrom === station._id 
                          ? "opacity-50 cursor-not-allowed" 
                          : "cursor-pointer"}`}
                      disabled={station._id === selectedFrom}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{station.name}</span>
                        <span className="text-xs text-gray-500">
                          {station.code} • {station.city}, {station.state}
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

      {selectedFrom && selectedTo && (
        <button
          onClick={handleSearch}
          className="mt-4 w-full bg-[#07561A] text-white py-2 px-4 rounded-md hover:bg-[#064a15] transition-colors"
        >
          Search Trains
        </button>
      )}
    </div>
  );
}
import React, { useState, useCallback, useMemo } from "react";
import { FaRoute } from "react-icons/fa";
import { Station } from "@/types/route.types";

interface FromToSelectorProps {
  stations: Station[];
  selectedFrom: string;
  selectedTo: string;
  onFromChange: (stationId: string) => void;
  onToChange: (stationId: string) => void;
}

export default function FromToSelector({
  stations,
  selectedFrom,
  selectedTo,
  onFromChange,
  onToChange,
}: FromToSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedFromStation = stations.find(s => s.id === selectedFrom);
  const selectedToStation = stations.find(s => s.id === selectedTo);

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
                      key={station.id}
                      onClick={() => {
                        onFromChange(station.id);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors
                        ${selectedFrom === station.id 
                          ? "bg-[#07561A] text-white" 
                          : "hover:bg-gray-50"}
                        ${selectedTo === station.id 
                          ? "opacity-50 cursor-not-allowed" 
                          : "cursor-pointer"}`}
                      disabled={station.id === selectedTo}
                    >
                      {station.name} ({station.code})
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-[#79747E] font-medium">To:</p>
                <div className="space-y-1 max-h-[40vh] overflow-y-auto">
                  {stations.map((station) => (
                    <button
                      key={station.id}
                      onClick={() => {
                        onToChange(station.id);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors
                        ${selectedTo === station.id 
                          ? "bg-[#07561A] text-white" 
                          : "hover:bg-gray-50"}
                        ${selectedFrom === station.id 
                          ? "opacity-50 cursor-not-allowed" 
                          : "cursor-pointer"}`}
                      disabled={station.id === selectedFrom}
                    >
                      {station.name} ({station.code})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
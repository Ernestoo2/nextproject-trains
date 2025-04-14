"use client";

import React, { useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";

interface DateSelectorProps {
  onDatesChange?: (departure: string, returnDate: string) => void;
}

export default function DateSelector({ onDatesChange }: DateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  const formatDate = (date: string) => {
    if (!date) return "Select Date";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleDateChange = (type: "departure" | "return", value: string) => {
    if (type === "departure") {
      setDepartureDate(value);
    } else {
      setReturnDate(value);
    }
    if (onDatesChange) {
      onDatesChange(
        type === "departure" ? value : departureDate,
        type === "return" ? value : returnDate,
      );
    }
  };

  return (
    <div className="relative border border-[#79747E] p-3 rounded-md flex items-center gap-3 text-sm">
      <span className="absolute -top-2 left-3 bg-slate-100 px-1 text-xs text-[#79747E]">
        Departure - Return
      </span>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 text-sm hover:border-gray-400 transition-colors"
      >
        <span className="font-medium text-[13px]">
          {formatDate(departureDate)} - {formatDate(returnDate)}
        </span>
        <FaCalendarAlt className="text-[#79747E] ml-auto" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20">
          <div className="p-4 grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="departureDate"
                className="text-xs text-[#79747E] mb-2"
              >
                Depart:
              </label>
              <input
                id="departureDate"
                type="date"
                value={departureDate}
                onChange={(e) => handleDateChange("departure", e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label
                htmlFor="returnDate"
                className="text-xs text-[#79747E] mb-2"
              >
                Return:
              </label>
              <input
                id="returnDate"
                type="date"
                value={returnDate}
                onChange={(e) => handleDateChange("return", e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

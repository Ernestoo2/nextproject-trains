"use client";

import React, { useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import { addDays, format } from "date-fns";

interface DateSelectorProps {
  onDatesChange: (date: string) => void;
  defaultDate?: string;
}

export default function DateSelector({ onDatesChange, defaultDate }: DateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(defaultDate || new Date().toISOString().split('T')[0]);

  // Get min date (today) and max date (14 days from today)
  const today = new Date();
  const maxDate = addDays(today, 14);

  const formatDisplayDate = (date: string) => {
    if (!date) return "Select Date";
    return format(new Date(date), "EEE, MMM d, yyyy");
  };

  const handleDateChange = (value: string) => {
    setSelectedDate(value);
    onDatesChange(value);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="border border-[#79747E] p-3 rounded-md">
        <span className="absolute -top-2 left-3 bg-white px-1 text-xs text-[#79747E]">
          Travel Date
        </span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center gap-3 text-sm hover:border-gray-400 transition-colors"
        >
          <span className="font-medium text-[13px]">
            {formatDisplayDate(selectedDate)}
          </span>
          <FaCalendarAlt className="text-[#79747E] ml-auto" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 w-full">
          <div className="p-4">
            <div>
              <label
                htmlFor="departureDate"
                className="text-xs text-[#79747E] mb-2 block"
              >
                Select Date:
              </label>
              <input
                id="departureDate"
                type="date"
                value={selectedDate}
                min={today.toISOString().split('T')[0]}
                max={maxDate.toISOString().split('T')[0]}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full p-2 border rounded focus:border-[#07561A] focus:ring-1 focus:ring-[#07561A] outline-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                * Schedules available for next 14 days
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

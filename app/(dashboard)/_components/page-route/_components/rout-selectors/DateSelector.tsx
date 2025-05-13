"use client";
import React, { useState, useCallback, useEffect } from "react";
import { addDays, endOfDay, format, isAfter, isBefore, isValid, startOfDay, differenceInDays } from "date-fns";
import { FaCalendarAlt } from "react-icons/fa";
import { useTrainSearchStore } from '@/store/trainSearchStore';

interface DateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export default function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day
  const maxDate = endOfDay(addDays(today, 21)); // 3 weeks from today

  const [isOpen, setIsOpen] = useState(false);
  const [validation, setValidation] = useState({
    isValid: true,
    error: null as string | null,
  });

  const { 
    filters, 
    updateFilters, 
    setLoading, 
    setError,
    isLoading,
    error 
  } = useTrainSearchStore();

  // Validate initial date on mount and sync with store
  useEffect(() => {
    if (selectedDate) {
      validateDate(selectedDate);
      if (selectedDate !== filters.date) {
        updateFilters({ date: selectedDate });
      }
    }
  }, [selectedDate, filters.date, updateFilters]);

  const validateDate = useCallback((dateStr: string): boolean => {
    const dateObj = new Date(dateStr);

    if (!isValid(dateObj)) {
      setValidation({
        isValid: false,
        error: "Invalid date format",
      });
      setError("Invalid date format");
      return false;
    }

    if (isBefore(dateObj, startOfDay(today))) {
      setValidation({
        isValid: false,
        error: "Cannot select a past date",
      });
      setError("Cannot select a past date");
      return false;
    }

    if (isAfter(dateObj, maxDate)) {
      setValidation({
        isValid: false,
        error: "Date must be within the next 21 days",
      });
      setError("Date must be within the next 21 days");
      return false;
    }

    setValidation({
      isValid: true,
      error: null,
    });
    setError(null);
    return true;
  }, [today, maxDate, setError]);

  const formatDisplayDate = useCallback((date: string) => {
    if (!date) return "Select Date";
    const dateObj = new Date(date);
    return isValid(dateObj) ? format(dateObj, "EEE, MMM d, yyyy") : "Select Date";
  }, []);

  const handleDateChange = useCallback(async (value: string) => {
    try {
      setLoading(true);
      if (validateDate(value)) {
        onDateChange(value);
        updateFilters({ date: value });
        setIsOpen(false);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update date');
    } finally {
      setLoading(false);
    }
  }, [validateDate, onDateChange, updateFilters, setLoading, setError]);

  // Calculate days remaining in the 3-week window
  const getDaysRemaining = useCallback((date: string) => {
    const selectedDate = new Date(date);
    const daysRemaining = differenceInDays(maxDate, selectedDate);
    return daysRemaining;
  }, [maxDate]);

  return (
    <div className="relative">
      <div className={`border ${!validation.isValid || error ? 'border-red-500' : 'border-[#79747E]'} p-3 rounded-md`}>
        <span className={`absolute -top-2 left-3 bg-white px-1 text-xs ${!validation.isValid || error ? 'text-red-500' : 'text-[#79747E]'}`}>
          Travel Date
        </span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center gap-3 text-sm hover:border-gray-400 transition-colors"
          aria-label="Select travel date"
          aria-expanded={isOpen}
          aria-invalid={!validation.isValid}
          disabled={isLoading}
        >
          <span className="font-medium text-[13px]">
            {formatDisplayDate(selectedDate)}
          </span>
          <FaCalendarAlt className={`${!validation.isValid || error ? 'text-red-500' : 'text-[#79747E]'} ml-auto`} />
        </button>
      </div>

      {(validation.error || error) && (
        <p className="text-red-500 text-xs mt-1" role="alert">
          {validation.error || error}
        </p>
      )}

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
                min={today.toISOString().split("T")[0]}
                max={maxDate.toISOString().split("T")[0]}
                onChange={(e) => handleDateChange(e.target.value)}
                className={`w-full p-2 border rounded ${
                  validation.isValid
                    ? 'focus:border-[#07561A] focus:ring-1 focus:ring-[#07561A]'
                    : 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                } outline-none`}
                aria-invalid={!validation.isValid}
                aria-describedby={validation.error ? "date-error" : undefined}
                disabled={isLoading}
              />
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-500">
                  * Schedules available for next 21 days
                </p>
                {selectedDate && (
                  <p className="text-xs text-[#07561A]">
                    {getDaysRemaining(selectedDate)} days remaining in booking window
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

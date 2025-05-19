"use client";
import React, { useState, useCallback, useEffect, useRef } from "react";
import { format, isAfter, isBefore, isValid, startOfDay, endOfDay, addDays } from "date-fns";
import { FaCalendarAlt } from "react-icons/fa";
import { useTrainSearchStore } from '@/store/trainSearchStore';
import { useAvailableDates } from '@/_hooks/useAvailableDates';

interface DateSelectorProps {
  initialDate: string; // Expected yyyy-MM-dd
  onDateChange: (date: string) => void;
}

const DEFAULT_VALIDATION = { isValid: true, error: null as string | null };
interface ValidationState { isValid: boolean; error: string | null; }

export default function DateSelector({ initialDate, onDateChange }: DateSelectorProps) {
  const today = startOfDay(new Date());
  const [internalSelectedDate, setInternalSelectedDate] = useState<string>(initialDate);
  const [isOpen, setIsOpen] = useState(false);
  const [validation, setValidation] = useState<ValidationState>(DEFAULT_VALIDATION);

  const currentValidationRef = useRef(validation);
  useEffect(() => {
    currentValidationRef.current = validation;
  }, [validation]);

  const { 
    isLoading: isTrainSearchLoading,
    error: trainSearchError, // Errors from the wider search store
  } = useTrainSearchStore();

  const {
    availableDates,
    isLoading: isLoadingDates,
    error: datesError, // Errors specifically from fetching available dates
  } = useAvailableDates();

  useEffect(() => {
    // Only update if initialDate prop truly differs from internal state
    if (initialDate !== internalSelectedDate) {
        setInternalSelectedDate(initialDate);
    }
  }, [initialDate]); // Removed internalSelectedDate from deps to avoid loop with parent potentially

  // This function now returns the validation state, instead of setting it directly
  const calculateValidationState = useCallback((dateStrToValidate: string): ValidationState => {
    if (isLoadingDates) {
      return { isValid: true, error: "Loading available dates..." }; // isValid: true might be debatable, but consistent with prev. error message
    }

    if (!dateStrToValidate) {
      return { isValid: false, error: "Date cannot be empty" };
    }
    
    const dateObj = new Date(dateStrToValidate + 'T00:00:00');
    if (!isValid(dateObj)) {
      return { isValid: false, error: "Invalid date format" };
    }
    if (isBefore(dateObj, today)) {
      return { isValid: false, error: "Cannot select a past date" };
    }
    if (!availableDates.includes(dateStrToValidate)) {
      return { isValid: false, error: "No schedules available for this date" };
    }
    return DEFAULT_VALIDATION; // If all checks pass
  }, [today, availableDates, isLoadingDates]); // Dependencies of the validation logic

  // Effect to re-validate when the selected date or data for validation changes
  useEffect(() => {
    let newValidationState: ValidationState;
    if (internalSelectedDate) {
      newValidationState = calculateValidationState(internalSelectedDate);
    } else if (!isLoadingDates) { // If no date selected and not loading, reset
      newValidationState = DEFAULT_VALIDATION;
    } else {
        // While loading and no date selected, keep current or default loading state
        newValidationState = { isValid: true, error: "Loading available dates..." };
    }

    if (currentValidationRef.current.isValid !== newValidationState.isValid || currentValidationRef.current.error !== newValidationState.error) {
      setValidation(newValidationState);
    }
  }, [internalSelectedDate, availableDates, isLoadingDates, calculateValidationState]);

  const formatDisplayDate = useCallback((date: string) => {
    if (!date) return "Select Date";
    const dateObj = new Date(date + 'T00:00:00');
    return isValid(dateObj) ? format(dateObj, "EEE, MMM d, yyyy") : "Select Date";
  }, []);

  const handleDateInputChange = useCallback((value: string) => {
    setInternalSelectedDate(value);
    const validationResult = calculateValidationState(value);
    // Update validation state immediately based on input change
    if (currentValidationRef.current.isValid !== validationResult.isValid || currentValidationRef.current.error !== validationResult.error) {
        setValidation(validationResult);
    }

    if (validationResult.isValid) {
      onDateChange(value);
      setIsOpen(false);
    }
  }, [calculateValidationState, onDateChange]);

  const minInputDate = availableDates.length > 0 && !isLoadingDates ? availableDates[0] : format(today, 'yyyy-MM-dd');
  const maxInputDate = availableDates.length > 0 && !isLoadingDates
    ? availableDates[availableDates.length - 1]
    : format(endOfDay(addDays(today, 20)), 'yyyy-MM-dd');

  const displayError = validation.error || datesError || trainSearchError;

  return (
    <div className="relative">
      <div className={`border ${displayError ? 'border-red-500' : 'border-[#79747E]'} p-3 rounded-md`}>
        <span className={`absolute -top-2 left-3 bg-white px-1 text-xs ${displayError ? 'text-red-500' : 'text-[#79747E]'}`}>
          Travel Date
        </span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center gap-3 text-sm hover:border-gray-400 transition-colors"
          aria-label="Select travel date"
          aria-expanded={isOpen}
          aria-invalid={!!displayError}
          disabled={isTrainSearchLoading || isLoadingDates}
        >
          <span className="font-medium text-[13px]">
            {formatDisplayDate(internalSelectedDate)}
          </span>
          <FaCalendarAlt className={`${displayError ? 'text-red-500' : 'text-[#79747E]'} ml-auto`} />
        </button>
      </div>

      {displayError && (
        <p className="text-red-500 text-xs mt-1" role="alert">
          {displayError}
        </p>
      )}

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 w-full min-w-[280px]">
          <div className="p-4">
            <div>
              <label
                htmlFor="departureDateInput"
                className="text-xs text-[#79747E] mb-2 block"
              >
                Select Date:
              </label>
              <input
                id="departureDateInput"
                type="date"
                value={internalSelectedDate}
                min={minInputDate}
                max={maxInputDate}
                onChange={(e) => handleDateInputChange(e.target.value)}
                className={`w-full p-2 border rounded ${
                  displayError
                    ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'focus:border-[#07561A] focus:ring-1 focus:ring-[#07561A]'
                } outline-none`}
                aria-invalid={!!displayError}
                aria-describedby={displayError ? "date-error-desc" : undefined}
                disabled={isTrainSearchLoading || isLoadingDates}
              />
              {displayError && <span id="date-error-desc" className="sr-only">{displayError}</span>}
              <div className="mt-2 space-y-1">
                {isLoadingDates && (
                  <p className="text-xs text-blue-500">Loading available dates...</p>
                )}
                {!isLoadingDates && datesError && (
                  <p className="text-xs text-red-500">Error loading dates: {datesError}</p>
                )}
                {!isLoadingDates && !datesError && availableDates.length === 0 && (
                  <p className="text-xs text-red-500">No schedules available.</p>
                )}
                {!isLoadingDates && !datesError && availableDates.length > 0 && (
                  <p className="text-xs text-green-600">
                    {availableDates.length} day(s) with schedules available.
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

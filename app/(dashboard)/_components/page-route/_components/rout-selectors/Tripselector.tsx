
import { TRIP_TYPES, TripType } from "@/types/shared/trains";
import { useState, useEffect, useCallback } from "react";
import { FaCaretDown } from "react-icons/fa";
import { TripSelectorPropsSchema, validateProps } from '@/types/shared/validation';
import { useTrainSearchStore } from '@/store/trainSearchStore';
import { TripSelectorProps } from "@/types/shared/selectors";

export default function TripSelector(props: TripSelectorProps) {
  // Validate props at runtime
  validateProps(TripSelectorPropsSchema, props);

  const { value, onChange } = props;
  const [isOpen, setIsOpen] = useState(false);
  const tripOptions = Object.values(TRIP_TYPES);
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
    if (value !== filters.tripType) {
      updateFilters({ tripType: value });
    }
  }, [value, filters.tripType, updateFilters]);

  const handleTripChange = useCallback(async (newValue: TripType) => {
    try {
      setLoading(true);
      setError(null);

      // Validate trip type
      if (!Object.values(TRIP_TYPES).includes(newValue)) {
        setError('Invalid trip type selected');
        return;
      }

      onChange(newValue);
      updateFilters({ tripType: newValue });
      setIsOpen(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update trip type');
    } finally {
      setLoading(false);
    }
  }, [onChange, updateFilters, setLoading, setError]);

  return (
    <div className="relative w-full">
      <div className={`border ${error ? 'border-red-500' : 'border-[#79747E]'} p-3 rounded-md flex items-center gap-3 text-sm`}>
        <span className={`absolute -top-2 left-3 bg-slate-100 px-1 text-xs ${error ? 'text-red-500' : 'text-[#79747E]'}`}>
          Trip
        </span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex items-center w-full gap-3 text-sm transition-colors rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
          aria-expanded={isOpen}
          aria-invalid={!!error}
        >
          <span className="font-medium text-gray-900">{value}</span>
          <FaCaretDown
            className={`${error ? 'text-red-500' : 'text-[#79747E]'} ml-auto transition-transform duration-200
                      ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {error && (
          <p className="text-red-500 text-xs mt-1" role="alert">
            {error}
          </p>
        )}

        {isOpen && (
          <div className="absolute left-0 z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg top-full">
            {tripOptions.map((option) => (
              <button
                key={option}
                onClick={() => handleTripChange(option as TripType)}
                className={`w-full text-left px-4 py-2 text-sm transition-colors
                          ${
                            value === option
                              ? "bg-[#07561A] text-white"
                              : "hover:bg-gray-50 text-gray-900"
                          }
                          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isLoading}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

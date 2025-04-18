"use client";
import React, { useState, useEffect  } from "react"; 
import Image from "next/image"; 
import search from "../../../../../public/Assets/Searchpic.png";
import search1 from "../../../../../public/Assets/Searchpic2.png";
import DateSlider from "./DateSlider";
import StationRouteCard from "./StationRouteCard";
import { ScheduleWithDetails } from "../_types/train.types";
type Breakpoint = "mobile" | "tablet" | "desktop";

const useBreakpoint = (): Breakpoint => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop");

  useEffect(() => {
    const handleBreakpointChange = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setBreakpoint("mobile");
      } else if (width < 1024) {
        setBreakpoint("tablet");
      } else {
        setBreakpoint("desktop");
      }
    };

    handleBreakpointChange();
    window.addEventListener("resize", handleBreakpointChange);
    return () => window.removeEventListener("resize", handleBreakpointChange);
  }, []);

  return breakpoint;
};

const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

interface TrainSearchResultsProps {
  initialLoading?: boolean;
}
 

const TrainSearchResults: React.FC<TrainSearchResultsProps> = ({
  initialLoading = false,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>("Wed 16");
  const [fromStation, setFromStation] = useState<string>("Port Harcourt");
  const [toStation, setToStation] = useState<string>("Enugu");
  const [schedules, setSchedules] = useState<ScheduleWithDetails[]>([]);
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `/api/schedules/search?from=${encodeURIComponent(fromStation)}&to=${encodeURIComponent(toStation)}&date=${encodeURIComponent(selectedDate)}`
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch schedules');
      }

      setSchedules(data.data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch schedules');
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = (departure: string, arrival: string) => {
    const [depHours, depMinutes] = departure.split(':').map(Number);
    const [arrHours, arrMinutes] = arrival.split(':').map(Number);
    
    let hourDiff = arrHours - depHours;
    let minuteDiff = arrMinutes - depMinutes;
    
    if (minuteDiff < 0) {
      hourDiff--;
      minuteDiff += 60;
    }
    
    if (hourDiff < 0) {
      hourDiff += 24;
    }
    
    return minuteDiff > 0 ? `${hourDiff} hours ${minuteDiff} minutes` : `${hourDiff} hours`;
  };

  useEffect(() => {
    fetchSchedules();
  }, [selectedDate]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-[#F5F5F5] min-h-screen w-full flex flex-col md:flex-row">
      {/* Left Section - Search and Filters */}
      <div className="w-full px-6 py-8 lg:w-2/3">
        <h2 className="text-2xl font-semibold text-[#374151] mb-4">
          Train Search
        </h2>

        <div className="flex flex-col mb-6">
          <div className="flex items-center gap-6">
            <div className="border-t-0 border-x-0 border-b-2 border-[#D1D5DB] p-4">
              <p className="text-sm text-[#6B7280]">{fromStation}</p>
            </div>

            <div className="border-t-0 w-1/2 border-x-0 border-b-2 border-[#D1D5DB] p-4">
              <p className="text-sm text-[#6B7280]">{toStation}</p>
            </div>
          </div>
          <div className="flex items-center w-full h-auto mx-auto mt-4 text-center">
            <button
              onClick={fetchSchedules}
              className="w-full py-2 px-4 bg-[#16A34A] text-white rounded-md text-sm font-medium"
            >
              Search for trains
            </button>
          </div>
        </div>

        <DateSlider onDateChange={handleDateChange} />
        
        <div className="mb-6">
          <Image
            src={search}
            alt="Train Planning"
            className="w-full h-auto mb-4 rounded-md"
          />
          <Image
            src={search1}
            alt="Train Planning"
            className="w-full h-auto mb-4 rounded-md"
          />
          
        </div>
      </div>

      {/* Right Section - Schedule List */}
      <div className="w-full lg:w-2/3 px-6 py-8 bg-[#F5F5F5] overflow-y-auto">
        <div className="items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-[#374151]">
            Available Trains
          </h2>
          <hr className="w-full h-1 bg-[#80808080]" />

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#16A34A]"></div>
            </div>
          ) : error ? (
            <div className="p-4 text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          ) : schedules.length === 0 ? (
            <div className="p-4 text-gray-500 text-center">
              No trains found for this route and date.
            </div>
          ) : (
            <div className="space-y-4">
              {schedules.map((schedule) => (
                <StationRouteCard
                  key={schedule._id} 
                  schedule={schedule }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainSearchResults;

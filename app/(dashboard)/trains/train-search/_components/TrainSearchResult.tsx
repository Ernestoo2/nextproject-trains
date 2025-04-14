"use client";
import React, { useState, useEffect, useRef } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Image from "next/image";
import Link from "next/link";
import search from "../../../../../public/Assets/Searchpic.png";
import { ITrain } from "@/app/utils/mongodb/types";
import DateSlider from "./DateSlider";
import TrainCard from "./TrainCard";
import { TrainDetails } from "../_types/train.types";

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

interface TrainSearchResultsProps {
  initialLoading?: boolean;
}

const TrainSearchResults: React.FC<TrainSearchResultsProps> = ({
  initialLoading = false,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>("Wed 16");
  const [trains, setTrains] = useState<ITrain[]>([]);
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useBreakpoint();

  const fetchTrains = async (pageNum: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/trains?page=${pageNum}&limit=10`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch trains');
      }

      // Validate train data structure
      const validatedTrains = data.data.map((train: TrainDetails) => {
        if (!train || typeof train !== 'object') {
          throw new Error('Invalid train data structure');
        }
        
        // Ensure required fields exist
        if (!train._id && !train.trainNumber) {
          throw new Error('Train data missing required fields');
        }
        
        if (!train.routes || !Array.isArray(train.routes)) {
          throw new Error('Train routes data is invalid');
        }
        
        return train;
      });
      
      if (pageNum === 1) {
        setTrains(validatedTrains);
      } else {
        setTrains(prev => [...prev, ...validatedTrains]);
      }
      setHasMore(page < data.pagination.pages);
    } catch (error) {
      console.error('Error fetching trains:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch trains');
      setTrains([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrains(page);
  }, [page, fetchTrains]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading]);

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
      {/* Left Section - Filters */}
      <div className="w-full px-6 py-8 lg:w-2/3">
        <h2 className="text-2xl font-semibold text-[#374151] mb-4">
          Your Search Results
        </h2>

        <div className="flex flex-col mb-6">
          <div className="flex items-center gap-6">
            <div className="border-t-0 border-x-0 border-b-2 border-[#D1D5DB] p-4">
              <p className="text-sm text-[#6B7280]">
                NDLS, New Delhi Railway Station
              </p>
            </div>

            <div className="border-t-0 w-1/2 border-x-0 border-b-2 border-[#D1D5DB] p-4">
              <p className="text-sm text-[#6B7280]">LJN, Lucknow Junction</p>
            </div>
          </div>
          <div className="flex items-center w-full h-auto mx-auto mt-4 text-center">
            <Link
              href="/trains/booking-success"
              className="w-full py-2 px-4 bg-[#16A34A] text-white rounded-md text-sm font-medium"
            >
              Search for trains
            </Link>
          </div>
        </div>

        <DateSlider onDateChange={handleDateChange} />
        <p className="text-sm text-[#6B7280] mt-4">
          Selected Date: {selectedDate}
        </p>
        <div className="mb-6">
          <Image
            src={search}
            alt="Train Planning"
            className="w-full h-auto mb-4 rounded-md"
          />
          <p className="text-sm font-medium">Planning your holidays?</p>
        </div>
        <div>
          <Image
            src={search}
            alt="Train Tourism"
            className="w-full h-auto mb-4 rounded-md"
          />
          <p className="text-sm font-medium">Train tourism packages</p>
          <p className="text-sm text-[#6B7280]">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eu
            eleifend magna.
          </p>
        </div>
      </div>

      {/* Right Section - Train List */}
      <div className="w-full lg:w-2/3 px-6 py-8 bg-[#F5F5F5] overflow-y-auto">
        <div className="items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-[#374151]">
            Available Trains
          </h2>
          <hr className="w-full h-1 bg-[#80808080]" />

          {error ? (
            <div className="p-4 text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          ) : loading && page === 1 ? (
            Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={`skeleton-${index}`} height={120} className="mb-4" />
            ))
          ) : trains.length === 0 ? (
            <div className="p-4 text-gray-500 text-center">
              No trains found. Please try a different search.
            </div>
          ) : (
            <div className="space-y-4">
              {trains.map((train) => {
                if (!train || !train.trainNumber) {
                  console.error('Invalid train data:', train);
                  return null;
                }
                return (
                  <TrainCard 
                    key={train._id ? train._id.toString() : `train-${train.trainNumber}`} 
                    train={train} 
                  />
                );
              })}
              {loading && (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#16A34A]"></div>
                </div>
              )}
              <div ref={loadMoreRef} className="h-10" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainSearchResults;

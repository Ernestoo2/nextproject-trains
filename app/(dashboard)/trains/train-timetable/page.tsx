"use client";
import React from "react";
import { TrainScheduleCard } from "./_components/TrainScheduleCard";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import type { ScheduleWithDetails, TrainClass } from "@/types/shared/trains";

export const dynamic = 'force-dynamic';

export default function TrainTimetablePage() {
  const searchParams = useSearchParams();
  const [schedules, setSchedules] = useState<ScheduleWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trainClasses, setTrainClasses] = useState<TrainClass[]>([]);

  // Fetch train classes on mount
  useEffect(() => {
    const fetchTrainClasses = async () => {
      try {
        const response = await fetch('/api/train-classes');
        if (!response.ok) {
          throw new Error('Failed to fetch train classes');
        }
        const data = await response.json();
        if (data.success && data.data?.trainClasses) {
          setTrainClasses(data.data.trainClasses);
        }
      } catch (error) {
        console.error('Error fetching train classes:', error);
      }
    };

    fetchTrainClasses();
  }, []);

  // Fetch schedules when search params change
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
      setLoading(true);
      setError(null);

        // Get all required parameters
        const rawParams = {
          fromStationId: searchParams.get("fromStationId"),
          toStationId: searchParams.get("toStationId"),
          date: searchParams.get("date"),
          classType: searchParams.get("classType"),
          tripType: searchParams.get("tripType"),
          adultCount: searchParams.get("adultCount") || "1",
          childCount: searchParams.get("childCount") || "0",
          infantCount: searchParams.get("infantCount") || "0"
        };

        // Validate required parameters
        if (!rawParams.fromStationId || !rawParams.toStationId || !rawParams.date) {
          throw new Error("Missing required search parameters");
        }

        // Filter out null values and create a clean params object
        const params: Record<string, string> = Object.entries(rawParams)
          .filter((entry): entry is [string, string] => entry[1] !== null)
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

        
        // Make the API call
        const response = await fetch(`/api/schedules/search?${new URLSearchParams(params)}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        if (!data.success) {
          throw new Error(data.message || "Failed to fetch schedules");
        }
         setSchedules(data.data);
      } catch (error) {
        console.error("Error fetching schedules:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch schedules");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [searchParams]);

  if (loading) {
  return (
        <div className="flex justify-center items-center py-12">
          <FaSpinner className="animate-spin text-4xl text-green-600 mr-3" />
          <p className="text-gray-600">Loading schedules...</p>
        </div>
    );
  }

  if (error) {
    return (
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
        </div>
    );
  }

  if (schedules.length === 0) {
    return (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            {searchParams.get("fromStationId") && searchParams.get("toStationId") && searchParams.get("date")
              ? "No schedules found for this route and date."
              : "Please select stations and date to view schedules."}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Try selecting a different date or route.
          </p>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Train Timetable</h1>
      
        <div className="space-y-4">
          {schedules.map((schedule) => (
            <TrainScheduleCard
              key={schedule._id}
              schedule={schedule}
              selectedClass={searchParams.get("classType") || "ECONOMY"}
              date={searchParams.get("date") || ""}
            />
          ))}
        </div>
    </div>
  );
}

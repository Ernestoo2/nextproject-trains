"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { ScheduleWithDetails } from "@/types/shared/schedule.types";
import type { ScheduleStatus } from "@/types/shared/trains";
import { parseISO } from 'date-fns';

export const dynamic = 'force-dynamic';

export default function DailyTrainsPage() {
  const [schedules, setSchedules] = useState<ScheduleWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  
  // Get current date in Nigerian time
  const getNigerianDate = () => {
    const date = new Date();
    return date.toLocaleString('en-NG', { 
      timeZone: 'Africa/Lagos',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).split(',')[0].split('/').reverse().join('-');
  };

  const date = searchParams.get("date") || getNigerianDate();

  // Format time to 12-hour format with AM/PM
  const formatTime = (timeString: string | Date) => {
    if (!timeString) return 'N/A';
    try {
      const dateObj = typeof timeString === 'string' ? parseISO(timeString) : timeString;
      return format(dateObj, 'HH:mm');
    } catch(e) {
      console.error("Error formatting time:", timeString, e);
      return 'Invalid Time';
    }
  };

  // Format date
  const formatDate = (dateString: string | Date) => {
     if (!dateString) return 'N/A';
     try {
       const dateObj = typeof dateString === 'string' ? parseISO(dateString) : dateString;
       return format(dateObj, 'M/d/yyyy');
     } catch(e) {
       console.error("Error formatting date:", dateString, e);
       return 'Invalid Date';
     }
  };

  // Group trains by status for better organization
  const groupedSchedules = React.useMemo(() => {
    const groups: Record<ScheduleStatus, ScheduleWithDetails[]> = {
      SCHEDULED: [],
      IN_PROGRESS: [],
      DELAYED: [],
      COMPLETED: [],
      CANCELLED: [],
    };

    schedules.forEach((schedule) => {
      const status = schedule.status;
      if (groups[status]) {
        groups[status].push(schedule);
      } else {
        console.warn(`Unknown schedule status encountered: ${status}`);
      }
    });

    return groups;
  }, [schedules]);

  // Get status badge color
  const getStatusColor = (status: ScheduleStatus) => {
    switch (status) {
      case "SCHEDULED":
        return "text-green-600";
      case "IN_PROGRESS":
        return "text-blue-600";
      case "DELAYED":
        return "text-yellow-600";
      case "COMPLETED":
        return "text-gray-600";
      case "CANCELLED":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/schedules/daily?date=${date}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch schedules");
        }

        if (data.success && Array.isArray(data.data)) {
          setSchedules(data.data);
        } else if (data.success) {
            setSchedules([]);
            setError("Received invalid data format from server.");
        } else {
          throw new Error(data.message || "Failed to fetch schedules");
        }
      } catch (error) {
        console.error("Error fetching schedules:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch schedules");
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [date]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-4 bg-red-100 text-red-700 border border-red-300 rounded">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Daily Schedules</h1>
        <p className="text-gray-600">
          Showing schedules for: {date ? format(new Date(`${date}T00:00:00`), "EEEE, MMMM d, yyyy") : 'N/A'}
        </p>
        <p className="text-sm text-gray-500">All times are in Nigerian Time (WAT)</p>
      </div>

      {Object.entries(groupedSchedules).map(([status, statusSchedules]) => 
        statusSchedules.length > 0 && (
          <div key={status} className="mb-8">
            <h2 className="text-xl font-semibold mb-4 capitalize">
              {status.toLowerCase().replace("_", " ")} Schedules ({statusSchedules.length})
            </h2>
      <div className="space-y-4">
              {statusSchedules.map((schedule) => (
                <Card key={schedule._id} className="p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    {/* Schedule Details */}
              <div className="md:w-2/3">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">{schedule.trainNumber || 'N/A'} - {schedule.trainName || 'N/A'}</h2>
                    <p className="text-gray-600">
                            {schedule.departureStation?.stationName || 'N/A'} ({schedule.departureStation?.stationCode || 'N/A'}) → {" "}
                            {schedule.arrivalStation?.stationName || 'N/A'} ({schedule.arrivalStation?.stationCode || 'N/A'})
                    </p>
                          {schedule.platform && <p className="text-sm text-gray-500 mt-1">Platform {schedule.platform}</p>}
                  </div>
                        <div className="text-right flex-shrink-0">
                    <p className="text-sm text-gray-500">Status</p>
                          <p className={`font-medium ${getStatusColor(schedule.status)}`}>
                            {schedule.status.replace("_", " ")}
                          </p>
                  </div>
                </div>

                      <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                        <div className="text-center">
                          <p className="text-lg font-semibold">{formatTime(schedule.departureTime || '')}</p>
                    <p className="text-sm text-gray-600">{formatDate(schedule.date || '')}</p>
                          <p className="text-sm text-gray-600">{schedule.departureStation?.stationName || 'N/A'}</p>
                          <p className="text-xs text-gray-500">{`${schedule.departureStation?.city || 'N/A'}, ${schedule.departureStation?.state || 'N/A'}`}</p>
                  </div>
                        <div className="text-center px-4">
                    <p className="text-sm text-gray-500">
                            {schedule.duration || calculateDuration(schedule.departureTime || '', schedule.arrivalTime || '')}
                    </p>
                          <div className="relative w-full h-1 bg-gray-200 my-1 rounded-full">
                            <div className="absolute left-0 top-0 h-1 w-full bg-green-500 rounded-full animate-pulse"></div>
                          </div>
                          <p className="text-xs text-gray-500">{schedule.route?.distance ?? 'N/A'} km</p>
                  </div>
                        <div className="text-center">
                          <p className="text-lg font-semibold">{formatTime(schedule.arrivalTime || '')}</p>
                    <p className="text-sm text-gray-600">{formatDate(schedule.date || '')}</p>
                          <p className="text-sm text-gray-600">{schedule.arrivalStation?.stationName || 'N/A'}</p>
                          <p className="text-xs text-gray-500">{`${schedule.arrivalStation?.city || 'N/A'}, ${schedule.arrivalStation?.state || 'N/A'}`}</p>
                  </div>
                </div>
              </div>

              {/* Classes and Booking */}
                    <div className="md:w-1/3 lg:w-1/4 border-l md:pl-6 md:border-l-gray-200">
                       <h3 className="text-md font-semibold mb-3 text-gray-700">Available Classes</h3>
                      <div className="space-y-3">
                        {schedule.availableClasses && schedule.availableClasses.length > 0 ? (
                          schedule.availableClasses.map((cls) => (
                      <div
                              key={cls.classCode || cls._id}
                              className="flex justify-between items-center text-sm p-2 rounded bg-white border border-gray-100"
                      >
                              <span className="font-medium text-gray-800">{cls.className || 'N/A'}</span>
                        <div className="flex items-center gap-2">
                                <span className="font-semibold text-green-700">
                                  ₦{(cls.fare ?? cls.baseFare ?? 0).toLocaleString()}
                          </span>
                                <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                  {cls.capacity ?? 'N/A'} seats
                          </span>
                        </div>
                      </div>
                          ))
                        ) : (
                            <p className="text-sm text-gray-500">No classes available.</p>
                        )}

                        {schedule.status === "SCHEDULED" && schedule.availableClasses && schedule.availableClasses.length > 0 && (
                    <Link
                            href={`/trains/review-booking?scheduleId=${schedule._id}&class=${schedule.availableClasses[0]?.classCode || schedule.availableClasses[0]?._id || ''}&date=${date}`}
                            className="block mt-4"
                    >
                            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                        Book Now
                      </Button>
                    </Link>
                  )}
                        {(schedule.status !== "SCHEDULED" || !schedule.availableClasses || schedule.availableClasses.length === 0) && (
                           <Button disabled className="w-full mt-4">
                              Booking Unavailable
                            </Button>
                        )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
          </div>
        )
      )}

      {schedules.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-gray-500">No train schedules found for this date.</p>
        </div>
      )}
    </div>
  );
}

function calculateDuration(departure: string, arrival: string): string {
  if (!departure || !arrival || !departure.includes(':') || !arrival.includes(':')) return "N/A";
  
  const [depHours, depMinutes] = departure.split(":").map(Number);
  const [arrHours, arrMinutes] = arrival.split(":").map(Number);

  if (isNaN(depHours) || isNaN(depMinutes) || isNaN(arrHours) || isNaN(arrMinutes)) return "N/A";

  const totalDepMinutes = depHours * 60 + depMinutes;
  let totalArrMinutes = arrHours * 60 + arrMinutes;

  if (totalArrMinutes < totalDepMinutes) {
    totalArrMinutes += 24 * 60;
  }

  const minuteDiff = totalArrMinutes - totalDepMinutes;
  const hourDiff = Math.floor(minuteDiff / 60);
  const remMinutes = minuteDiff % 60;

  return remMinutes > 0
    ? `${hourDiff}h ${remMinutes}m`
    : `${hourDiff}h`;
}

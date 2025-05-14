"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import BookingLeft from "./_components/BookingLeft";
import BookingRight from "./_components/BookingRight";
import { useBookingStore } from "@/store/bookingStore";
import { toast } from "sonner";
import type { ScheduleWithDetails } from "@/types/shared/database";
import type { TrainClass } from "@/types/shared/trains";

// Define a more specific type for items in availableClasses array
type AvailableClassInfo = TrainClass & { availableSeats: number; fare: number };

const ReviewBooking: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [schedule, setSchedule] = useState<ScheduleWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { bookingState, actions } = useBookingStore();

  useEffect(() => {
    const fetchScheduleDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const scheduleId = searchParams.get("scheduleId");
        const selectedClass = searchParams.get("class");
        const date = searchParams.get("date");

        if (!scheduleId || !selectedClass || !date) {
          setError("Missing required parameters (scheduleId, class, or date).");
          setLoading(false);
          toast.error("Missing required parameters to fetch schedule.");
          return;
        }

        const response = await fetch(`/api/schedules/${scheduleId}?class=${selectedClass}&date=${date}&populate=train,route,departureStation,arrivalStation`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch schedule details");
        }

        const data = await response.json();
        if (data.success && data.data) {
          setSchedule(data.data);
          actions.selectSchedule(data.data);
          if (data.data.availableClasses && data.data.availableClasses.length > 0) {
            const classInfo = data.data.availableClasses.find((c: AvailableClassInfo) => c.classCode === selectedClass);
            if (classInfo) {
              const passengerCount = bookingState.passengers?.length || 1;
              actions.calculateFare(classInfo.baseFare || classInfo.fare || 0, passengerCount);
            }
          }
        } else {
          setError(data.message || "Schedule not found or invalid data.");
          toast.error(data.message || "Schedule not found.");
        }
      } catch (err) {
        console.error("Error fetching schedule details:", err);
        const errorMessage = err instanceof Error ? err.message : "An error occurred while fetching schedule details";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchScheduleDetails();
    } else if (session === null) {
      router.push("/auth/signin");
    }
  }, [searchParams.toString(), session, router, actions, bookingState.passengers?.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (session === null && !loading) {
    return null;
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 p-4 bg-red-100 border border-red-400 rounded-md text-center">
            <h2 className="text-lg font-semibold mb-2">Error Loading Schedule</h2>
            <p>{error}</p>
            <button 
                onClick={() => router.back()}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
                Go Back
            </button>
        </div>
      </div>
    );
  }

  if (!schedule && !loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">No schedule details available for the selected criteria.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <BookingLeft />
        {schedule && <BookingRight schedule={schedule} travelers={bookingState.passengers || []} />}
      </div>
    </div>
  );
};

export default ReviewBooking;

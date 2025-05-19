"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import BookingLeft from "./_components/BookingLeft";
import BookingRight from "./_components/BookingRight";
import { useBookingStore } from "@/store/bookingStore";
import { toast } from "sonner";

// Define a more specific type for items in availableClasses array
// type AvailableClassInfo = TrainClass & { availableSeats: number; fare: number }; // This might not be needed if scheduleDetails has full fare map

const ReviewBooking: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  // const [schedule, setSchedule] = useState<ScheduleWithDetails | null>(null); // Schedule will come from store
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { bookingState, actions } = useBookingStore();
  const { scheduleDetails } = bookingState; // Get scheduleDetails from the store

  useEffect(() => {
    const fetchScheduleDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const scheduleId = searchParams.get("scheduleId");
        const classIdFromQuery = searchParams.get("class"); // This is the class ID/code
        const date = searchParams.get("date");

        if (!scheduleId || !classIdFromQuery || !date) {
          setError("Missing required parameters (scheduleId, class, or date).");
          setLoading(false);
          toast.error("Missing required parameters to fetch schedule.");
          return;
        }

        // The API now returns the full 'fare' map in scheduleDetails
        const response = await fetch(`/api/schedules/${scheduleId}?class=${classIdFromQuery}&date=${date}&populate=train,route,departureStation,arrivalStation`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch schedule details");
        }

        const apiResponse = await response.json(); // Renamed to avoid conflict
        if (apiResponse.success && apiResponse.data) {
          // setSchedule(apiResponse.data); // No longer setting local state for schedule
          // Use the new action to set schedule and selected classId in the store
          actions.selectScheduleAndClass(apiResponse.data, classIdFromQuery);
          // The recalculateBookingTotals is called within selectScheduleAndClass
        } else {
          setError(apiResponse.message || "Schedule not found or invalid data.");
          toast.error(apiResponse.message || "Schedule not found.");
        }
      } catch (err) {
        // console.error("Error fetching schedule details:", err); // Keep this for actual errors
        const errorMessage = err instanceof Error ? err.message : "An error occurred while fetching schedule details";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchScheduleDetails();
    } else if (session === null) { // Check for explicit null, status might be 'loading'
      router.push("/auth/signin?callbackUrl=" + encodeURIComponent(window.location.pathname + window.location.search));
    }
    // searchParams can be stringified or use individual gets as deps
  }, [searchParams.get("scheduleId"), searchParams.get("class"), searchParams.get("date"), session, router, actions]);

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

  if (!scheduleDetails && !loading && !error) { // Check scheduleDetails from store
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
        {/* Pass scheduleDetails from store to BookingRight */}
        {scheduleDetails && <BookingRight schedule={scheduleDetails} travelers={bookingState.passengers || []} />}
      </div>
    </div>
  );
};

export default ReviewBooking;

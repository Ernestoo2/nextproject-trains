"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookingLeft } from "./_components/BookingLeft";
import { BookingRight } from "./_components/BookingRight";
import { BookingDetails, TrainClassType } from "@/types/shared/booking";
import { Schedule } from "@/types/shared/database";
import { ApiResponse, ApiSuccessResponse, ApiErrorResponse } from "@/types/shared/api";

interface ReviewBookingState {
  schedule: Schedule | null;
  loading: boolean;
  error: string | null;
  bookingId: string | null;
}

const ReviewBooking: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<ReviewBookingState>({
    schedule: null,
    loading: true,
    error: null,
    bookingId: null
  });

  // Generate booking ID only once when component mounts
  useEffect(() => {
    const id = searchParams.get('bookingId') || `booking-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setState(prev => ({ ...prev, bookingId: id }));

    // Update URL with booking ID if not present
    if (!searchParams.get('bookingId')) {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set('bookingId', id);
      router.replace(`${window.location.pathname}?${newParams.toString()}`);
    }
  }, []);

  useEffect(() => {
    const fetchScheduleDetails = async () => {
      try {
        const scheduleId = searchParams.get("scheduleId");
        const selectedClass = searchParams.get("class") as TrainClassType;
        let date = searchParams.get("date");

        if (!date) {
          const today = new Date();
          date = today.toISOString().split("T")[0];
          const newParams = new URLSearchParams(searchParams.toString());
          newParams.set('date', date);
          router.replace(`${window.location.pathname}?${newParams.toString()}`);
          return;
        }

        if (!scheduleId || !selectedClass) {
          throw new Error("Missing required parameters: scheduleId or class");
        }

        const response = await fetch(
          `/api/schedules/${scheduleId}?class=${selectedClass}&date=${date}&populate=train,route`
        );

        if (!response.ok) {
          const errorData: ApiErrorResponse = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data: ApiSuccessResponse<any> = await response.json();
        if (data.success && data.data) {
          // Transform the API response to match the Schedule type
          const transformedSchedule: Schedule = {
            _id: data.data._id,
            createdAt: data.data.createdAt,
            updatedAt: data.data.updatedAt,
            isActive: data.data.isActive,
            train: data.data.train._id,
            route: data.data.route._id,
            departureTime: data.data.departureTime,
            arrivalTime: data.data.arrivalTime,
            date: new Date(date),
            availableSeats: data.data.availableSeats || {},
            status: data.data.status,
            platform: data.data.platform,
            fare: data.data.fare || {},
            duration: data.data.duration || ""
          };
          
          setState(prev => ({
            ...prev,
            schedule: transformedSchedule,
            loading: false
          }));
        } else {
          throw new Error(data.message || "Schedule not found");
        }
      } catch (error) {
        console.error("Error fetching schedule details:", error);
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : "An error occurred while fetching schedule details",
          loading: false
        }));
      }
    };

    fetchScheduleDetails();
  }, [searchParams, router]);

  if (state.loading || !state.bookingId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (session === null) {
    router.push("/auth/signin");
    return null;
  }

  if (state.error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{state.error}</div>
      </div>
    );
  }

  if (!state.schedule) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">No schedule details available</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <BookingLeft bookingId={state.bookingId} schedule={state.schedule} />
        <BookingRight bookingId={state.bookingId} schedule={state.schedule} />
      </div>
    </div>
  );
};

export default ReviewBooking;

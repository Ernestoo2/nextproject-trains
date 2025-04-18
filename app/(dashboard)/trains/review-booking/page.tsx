"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import BookingLeft from "./_components/BookingLeft";
import BookingRight from "./_components/BookingRight"; 

const ReviewBooking: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [schedule, setSchedule] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScheduleDetails = async () => {
      try {
        const scheduleId = searchParams.get("scheduleId");
        const selectedClass = searchParams.get("class");
        const date = searchParams.get("date");

        if (!scheduleId || !selectedClass || !date) {
          setError("Missing required parameters");
          return;
        }

        const response = await fetch(`/api/schedules/${scheduleId}?class=${selectedClass}&date=${date}`);
        if (!response.ok) {
          throw new Error("Failed to fetch schedule details");
        }

        const data = await response.json();
        if (data.success) {
          setSchedule(data.schedule);
        } else {
          setError(data.message || "Schedule not found");
        }
      } catch (error) {
        console.error("Error fetching schedule details:", error);
        setError("An error occurred while fetching schedule details");
      } finally {
        setLoading(false);
      }
    };

    fetchScheduleDetails();
  }, [searchParams]);

  if (loading) {
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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">No schedule details available</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <BookingLeft />
        <BookingRight schedule={schedule} travelers={[]} />
      </div>
    </div>
  );
};

export default ReviewBooking;

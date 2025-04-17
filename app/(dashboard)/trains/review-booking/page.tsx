"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import BookingLeft from "./_components/BookingLeft";
import BookingRight from "./_components/BookingRight";
import { getTrainDetails } from "@/api/api";
import { TrainDetails } from "@/api/types/types";

const ReviewBooking: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [train, setTrain] = useState<TrainDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrainDetails = async () => {
      try {
        const trainId = searchParams.get("trainId");
        if (!trainId) {
          setError("Train ID is required");
          return;
        }

        const response = await getTrainDetails(trainId);
        if (response.success && response.data && response.data.length > 0) {
          setTrain(response.data[0]);
        } else {
          setError(response.message || "Train not found");
        }
      } catch (error) {
        console.error("Error fetching train details:", error);
        setError("An error occurred while fetching train details");
      } finally {
        setLoading(false);
      }
    };

    fetchTrainDetails();
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

  if (!train) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">No train details available</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <BookingLeft />
        <BookingRight train={train} travelers={[]} />
      </div>
    </div>
  );
};

export default ReviewBooking;

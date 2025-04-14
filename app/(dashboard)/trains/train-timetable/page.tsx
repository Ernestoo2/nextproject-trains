"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ITrain } from "@/app/utils/mongodb/types";

export default function TrainTimetable() {
  const searchParams = useSearchParams();
  const trainId = searchParams.get("trainId");
  const [train, setTrain] = useState<ITrain | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrainDetails = async () => {
      if (!trainId) {
        setError("Train ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/trains?trainId=${trainId}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          setTrain(data.data);
        } else {
          setError(data.message || "Train not found");
        }
      } catch (error) {
        setError("Failed to fetch train details");
        console.error("Error fetching train details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainDetails();
  }, [trainId]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={`skeleton-${i}`} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold text-gray-800">
          {error}
        </h1>
      </div>
    );
  }

  if (!train) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold text-gray-800">
          Train not found
        </h1>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">
          {train.trainName} ({train.trainNumber})
        </h1>
        <Link
          href={`/review-booking?trainId=${train._id}`}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Book Now
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Train Schedule</h2>
        <div className="space-y-4">
          {train.routes?.map((route, index) => (
            <div
              key={`route-${route.station?._id || index}`}
              className="flex items-center justify-between p-4 border-b"
            >
              <div className="flex-1">
                <h3 className="font-medium">{route.station?.name || "Unknown Station"}</h3>
                <p className="text-sm text-gray-600">
                  Station Code: {route.station?.code || "N/A"}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">{route.arrivalTime || "N/A"}</p>
                <p className="text-sm text-gray-600">Day {route.day || 0}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Available Classes</h2>
          <div className="flex gap-4">
            {train.classes?.map((trainClass) => (
              <div 
                key={`class-${trainClass._id}`} 
                className="px-4 py-2 border rounded-md"
              >
                <p className="font-medium">{trainClass.name || "Unknown Class"}</p>
                <p className="text-sm text-gray-600">Code: {trainClass.code || "N/A"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

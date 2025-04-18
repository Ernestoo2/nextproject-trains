"use client";

import { useEffect, useState } from 'react';
import { DailyTrain } from './_types/daily-trains.types';
import { getDailyTrains } from './_services/daily-trains.service';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Clock, Train } from "lucide-react";

export default function DailyTrainsPage() {
  const [trains, setTrains] = useState<DailyTrain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrains = async () => {
      try {
        const response = await getDailyTrains();
        if (response.success) {
          setTrains(response.data);
        } else {
          setError(response.message || 'Failed to fetch trains');
        }
      } catch (err) {
        setError('An error occurred while fetching trains');
      } finally {
        setLoading(false);
      }
    };

    fetchTrains();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Today's Available Trains</h1>
      <div className="space-y-4">
        {trains.map((train) => (
          <Card key={train._id} className="p-4 sm:p-6 mb-4 hover:shadow-lg transition-shadow">
            <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
              {/* Train Header Section */}
              <div className="md:w-1/3 space-y-2">
                <div className="flex items-center gap-3">
                  <Train className="text-xl sm:text-2xl text-green-600" />
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold">
                      {train.trainNumber} - {train.trainName}
                    </h3>
                    <p className={`text-xs sm:text-sm ${
                      train.status === 'SCHEDULED' ? 'text-green-600' :
                      train.status === 'IN_PROGRESS' ? 'text-blue-600' :
                      train.status === 'COMPLETED' ? 'text-gray-600' :
                      'text-red-600'
                    }`}>
                      {train.status}
                    </p>
                  </div>
                </div>
              </div>

              {/* Journey Details */}
              <div className="flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  {/* Departure */}
                  <div className="space-y-1">
                    <p className="text-lg sm:text-xl font-bold">{train.departureTime}</p>
                    <div>
                      <p className="text-sm sm:text-base text-gray-600">
                        {train.departureStation.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {train.departureStation.code}
                      </p>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Clock className="hidden sm:block" />
                      <span className="text-xs sm:text-sm">Duration</span>
                    </div>
                    <div className="w-full h-0.5 bg-gray-200 relative">
                      <div className="absolute w-2 h-2 bg-gray-400 rounded-full -top-1 left-0" />
                      <div className="absolute w-2 h-2 bg-gray-400 rounded-full -top-1 right-0" />
                    </div>
                  </div>

                  {/* Arrival */}
                  <div className="space-y-1 text-right">
                    <p className="text-lg sm:text-xl font-bold">{train.arrivalTime}</p>
                    <div>
                      <p className="text-sm sm:text-base text-gray-600">
                        {train.arrivalStation.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {train.arrivalStation.code}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Classes and Booking */}
              <div className="md:w-1/3 lg:w-1/4">
                <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-2">
                    {train.availableClasses.map((cls) => (
                      <div 
                        key={cls.code}
                        className="flex justify-between items-center text-sm sm:text-base"
                      >
                        <span className="font-medium">{cls.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">₦{cls.baseFare}</span>
                          <span className="text-xs sm:text-sm text-gray-500">
                            ({cls.availableSeats})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {train.status === 'SCHEDULED' && (
                    <Link
                      href={`/trains/review-booking?scheduleId=${train._id}&class=${train.availableClasses[0]?.code}&date=${new Date().toISOString().split('T')[0]}`}
                      className="block"
                    >
                      <Button className="w-full text-sm sm:text-base py-2 sm:py-3 bg-green-600 hover:bg-green-700">
                        Book Now
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 
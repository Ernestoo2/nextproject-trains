"use client";
 
import { ScheduleWithDetails, TrainClass } from '@/(dashboard)/trains/train-search/_types/train.types';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Clock, Train } from "lucide-react";

interface TrainScheduleCardProps {
  schedule: ScheduleWithDetails;
  selectedClass: string;
  date: string;
}

export function TrainScheduleCard({
  schedule,
  selectedClass,
  date
}: TrainScheduleCardProps) {
  // Use the first available class if selectedClass is not provided
  const defaultClass = schedule.availableClasses[0]?.code || '';
  const classToUse = selectedClass || defaultClass;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'text-green-600';
      case 'IN_PROGRESS':
        return 'text-blue-600';
      case 'COMPLETED':
        return 'text-gray-600';
      case 'CANCELLED':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (!schedule) {
    return null;
  }

  return (
    <Card className="p-4 sm:p-6 mb-4 hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
        {/* Train Header Section */}
        <div className="md:w-1/3 space-y-2">
          <div className="flex items-center gap-3">
            <Train className="text-xl sm:text-2xl text-green-600" />
            <div>
              <h3 className="text-base sm:text-lg font-semibold">
                {schedule.trainNumber} - {schedule.trainName}
              </h3>
              <p className={`text-xs sm:text-sm ${getStatusColor(schedule.status)}`}>
                {schedule.status}
              </p>
            </div>
          </div>
        </div>

        {/* Journey Details */}
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {/* Departure */}
            <div className="space-y-1">
              <p className="text-lg sm:text-xl font-bold">{schedule.departureTime}</p>
              <div>
                <p className="text-sm sm:text-base text-gray-600">
                  {schedule.departureStation.name}
                </p>
                <p className="text-xs text-gray-500">
                  {schedule.departureStation.city}, {schedule.departureStation.state}
                </p>
              </div>
            </div>

            {/* Duration */}
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="flex items-center gap-2 text-gray-500">
                <Clock className="hidden sm:block" />
                <span className="text-xs sm:text-sm">{schedule.duration}</span>
              </div>
              <div className="w-full h-0.5 bg-gray-200 relative">
                <div className="absolute w-2 h-2 bg-gray-400 rounded-full -top-1 left-0" />
                <div className="absolute w-2 h-2 bg-gray-400 rounded-full -top-1 right-0" />
              </div>
            </div>

            {/* Arrival */}
            <div className="space-y-1 text-right">
              <p className="text-lg sm:text-xl font-bold">{schedule.arrivalTime}</p>
              <div>
                <p className="text-sm sm:text-base text-gray-600">
                  {schedule.arrivalStation.name}
                </p>
                <p className="text-xs text-gray-500">
                  {schedule.arrivalStation.city}, {schedule.arrivalStation.state}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Classes and Booking */}
        <div className="md:w-1/3 lg:w-1/4">
          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              {schedule.availableClasses.map((cls: TrainClass) => (
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

            {schedule.status === 'SCHEDULED' && (
              <Link
                href={`/trains/review-booking?scheduleId=${schedule._id}&class=${classToUse}&date=${date}`}
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
  );
} 
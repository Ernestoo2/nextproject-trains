"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Clock, Train, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";

interface TrainScheduleCardProps {
  schedule: import("@/types/shared/trains").ScheduleWithDetails;
  selectedClass: string;
  date: string;
}

export function TrainScheduleCard({
  schedule,
  selectedClass,
  date,
}: TrainScheduleCardProps) {
  // Use the first available class if selectedClass is not provided
  const defaultClass = schedule.availableClasses[0]?.classCode || "";
  const classToUse = selectedClass || defaultClass;

  // Format the date for display
  const formattedDate = date ? format(parseISO(date), 'M/d/yyyy') : 'N/A';
  const formattedDepartureTime = schedule.departureTime ? format(schedule.departureTime, 'HH:mm') : 'N/A';
  const formattedArrivalTime = schedule.arrivalTime ? format(schedule.arrivalTime, 'HH:mm') : 'N/A';

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "text-green-600 bg-green-50";
      case "IN_PROGRESS":
        return "text-blue-600 bg-blue-50";
      case "COMPLETED":
        return "text-gray-600 bg-gray-50";
      case "CANCELLED":
        return "text-red-600 bg-red-50";
      case "DELAYED":
        return "text-orange-600 bg-orange-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (!schedule) {
    console.warn("No schedule data provided to TrainScheduleCard");
    return null;
  }

  const bookingUrl = `/trains/review-booking?scheduleId=${schedule._id}&class=${classToUse}&date=${date}`;

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
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getStatusColor(schedule.status)}>
                  {schedule.status}
                </Badge>
                {schedule.platform && (
                  <Badge variant="outline" className="bg-blue-50">
                    Platform {schedule.platform}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {schedule.status === "DELAYED" && schedule.delayReason && (
            <div className="flex items-center gap-2 text-orange-600 bg-orange-50 p-2 rounded-md">
              <AlertTriangle className="h-4 w-4" />
              <p className="text-sm">{schedule.delayReason}</p>
            </div>
          )}
        </div>

        {/* Journey Details */}
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {/* Departure */}
            <div className="space-y-1">
              <p className="text-lg sm:text-xl font-bold">
                {formattedDepartureTime}
              </p>
              {schedule.actualDepartureTime && (schedule.status === "DELAYED" || schedule.status === "IN_PROGRESS" || schedule.status === "COMPLETED") && (
                <p className="text-sm text-orange-600">
                  Actual: {schedule.actualDepartureTime}
                </p>
              )}
              <div>
                <p className="text-sm sm:text-base text-gray-600">
                  {schedule.departureStation.stationName}
                </p>
                <p className="text-xs text-gray-500">
                  {`${schedule.departureStation.city}, ${schedule.departureStation.state}`}
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
              {schedule.distance && (
                <span className="text-xs text-gray-500">{schedule.distance} km</span>
              )}
            </div>

            {/* Arrival */}
            <div className="space-y-1 text-right">
              <p className="text-lg sm:text-xl font-bold">
                {formattedArrivalTime}
              </p>
              {schedule.actualArrivalTime && (schedule.status === "DELAYED" || schedule.status === "COMPLETED") && (
                <p className="text-sm text-orange-600">
                  Actual: {schedule.actualArrivalTime}
                </p>
              )}
              <div>
                <p className="text-sm sm:text-base text-gray-600">
                  {schedule.arrivalStation.stationName}
                </p>
                <p className="text-xs text-gray-500">
                  {`${schedule.arrivalStation.city}, ${schedule.arrivalStation.state}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Classes and Booking */}
        <div className="md:w-1/3 lg:w-1/4">
          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              {schedule.availableClasses.map((cls) => (
                <div
                  key={cls.classCode}
                  className="flex justify-between items-center text-sm sm:text-base"
                >
                  <span className="font-medium">{cls.className}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">₦{cls.fare.toLocaleString()}</span>
                    <span className="text-xs sm:text-sm text-gray-500">
                      ({cls.availableSeats || 0})
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {schedule.status === "SCHEDULED" && (
              <Link href={bookingUrl} className="block">
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

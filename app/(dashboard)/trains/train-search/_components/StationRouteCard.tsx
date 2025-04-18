"use client";

import React from "react";
import Link from "next/link";
import { ScheduleWithDetails, TrainClass } from "../_types/train.types";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaTag } from "react-icons/fa";

interface StationRouteCardProps {
  schedule: ScheduleWithDetails;
}

const PROMO_CODES = [
  {
    code: 'BOOKNOW',
    description: '50% off up to ₦100',
    discount: 50,
    maxDiscount: 100,
    type: 'PERCENTAGE' as const,
  },
  {
    code: 'FIRSTTIME',
    description: '20% off',
    discount: 20,
    type: 'PERCENTAGE' as const,
  },
];

export function StationRouteCard({ schedule }: StationRouteCardProps) {
  if (!schedule) return null;

  const {
    trainNumber,
    trainName,
    departureTime,
    arrivalTime,
    departureStation,
    arrivalStation,
    duration,
    availableClasses = [],
    _id,
  } = schedule;

  // Type guard for required data
  if (!departureStation || !arrivalStation) return null;

  const formatTime = (timeString: string): string => {
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      return format(date, "hh:mm a");
    } catch {
      return timeString;
    }
  };

  const renderClassInfo = (classInfo: TrainClass) => (
    <div 
      key={classInfo.code} 
      className="flex justify-between items-center p-2 border rounded"
    >
      <span className="font-medium">{classInfo.name}</span>
      <div className="text-right">
        <p className="font-semibold text-green-600">
          ₦{classInfo.baseFare.toLocaleString()}
        </p>
        <p className="text-xs text-gray-500">
          {classInfo.availableSeats} seats
        </p>
      </div>
    </div>
  );

  return (
    <Card className="w-full mb-4">
      <CardContent className="p-6">
        {/* Train Details */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold">
            {trainNumber} - {trainName}
          </h3>
          <p className="text-sm text-[#07561A]">
            {availableClasses[0]?.name ?? 'Standard'} • Tatkal Quota
          </p>
        </div>

        {/* Journey Details */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-lg font-bold">{formatTime(departureTime)}</p>
            <p className="text-sm text-gray-600">{departureStation.name}</p>
            <p className="text-xs text-gray-500">
              {departureStation.city}, {departureStation.state}
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500">{duration || '8 hours'}</p>
            <div className="w-24 h-0.5 bg-gray-300 my-1 relative">
              <div className="absolute w-2 h-2 bg-gray-400 rounded-full -top-1 left-0" />
              <div className="absolute w-2 h-2 bg-gray-400 rounded-full -top-1 right-0" />
            </div>
          </div>

          <div className="text-right">
            <p className="text-lg font-bold">{formatTime(arrivalTime)}</p>
            <p className="text-sm text-gray-600">{arrivalStation.name}</p>
            <p className="text-xs text-gray-500">
              {arrivalStation.city}, {arrivalStation.state}
            </p>
          </div>
        </div>

        {/* Offers Section */}
        {availableClasses.length > 0 && (
          <div className="mb-4">
            {PROMO_CODES.map((promo) => (
              <div key={promo.code} className="flex items-center gap-2 mb-2">
                <FaTag className="text-green-600" />
                <span className="text-sm">
                  {promo.description} | Use code {promo.code}
                  <button className="ml-2 text-[#07561A] font-medium">
                    Apply
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Available Classes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {availableClasses.map(renderClassInfo)}
        </div>

        {/* Book Now Button */}
        <div className="flex justify-end">
          <Link 
            href={`/trains/review-booking?scheduleId=${_id}&class=${availableClasses[0]?.code ?? ''}`}
          >
            <Button 
              className="bg-green-600 hover:bg-green-700"
              disabled={!availableClasses.length}
            >
              Book Now
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default StationRouteCard; 
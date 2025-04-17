"use client";

import React from "react";
import Link from "next/link";
import { ScheduleWithDetails } from "../_types/train.types";
import { format } from "date-fns"; 
import { Clock, MapPin, Train } from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface StationRouteCardProps {
  schedule: ScheduleWithDetails;
}

export function StationRouteCard({ schedule }: StationRouteCardProps) {
  const {
    train,
    fromStation,
    toStation,
    departureTime,
    arrivalTime,
    status,
    platform,
    delayedBy,
    availableSeats,
    fare,
  } = schedule;

  const formatTime = (date: Date) => {
    return format(new Date(date), "hh:mm a");
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), "MMM dd, yyyy");
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return "bg-green-500";
      case "delayed":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">
          {train.name} ({train.number})
        </CardTitle>
        <Badge className={getStatusColor(status)}>{status}</Badge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">From</p>
            <p className="font-semibold">{fromStation.name}</p>
            <p className="text-sm">{formatTime(departureTime)}</p>
            <p className="text-sm text-gray-500">Platform {platform}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">To</p>
            <p className="font-semibold">{toStation.name}</p>
            <p className="text-sm">{formatTime(arrivalTime)}</p>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-semibold mb-2">Available Seats & Fare</h4>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(availableSeats).map(([classType, seats]) => (
              <div key={classType} className="flex justify-between items-center">
                <span className="capitalize">{classType}</span>
                <div className="text-right">
                  <p className="font-semibold">₦{fare[classType]}</p>
                  <p className="text-sm text-gray-500">{seats} seats left</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Link href={`/booking/${schedule._id}`}>
            <Button>Book Now</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default StationRouteCard; 
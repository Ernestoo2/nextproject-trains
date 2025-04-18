import React from 'react';
import { Card } from "@/components/ui/card";
import { FaClock, FaTrain } from 'react-icons/fa';
import { Button } from "@/components/ui/button";
import Link from 'next/link';

interface Station {
  name: string;
  code: string;
  city: string;
  state: string;
}

interface TrainClass {
  _id: string;
  name: string;
  code: string;
  baseFare: number;
  availableSeats: number;
}

interface TrainScheduleCardProps {
  trainNumber: string;
  trainName: string;
  departureTime: string;
  arrivalTime: string;
  departureStation: Station;
  arrivalStation: Station;
  duration: string;
  availableClasses: TrainClass[];
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  schedule: any;
  train: any;
  selectedClass: string;
  date: string;
}

export function TrainScheduleCard({
  trainNumber,
  trainName,
  departureTime,
  arrivalTime,
  departureStation,
  arrivalStation,
  duration,
  availableClasses,
  status,
  schedule,
  train,
  selectedClass,
  date
}: TrainScheduleCardProps) {
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

  return (
    <Card className="p-6 mb-4 hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="flex items-center gap-3">
          <FaTrain className="text-2xl text-green-600" />
          <div>
            <h3 className="text-lg font-semibold">{trainNumber} - {trainName}</h3>
            <p className={`text-sm ${getStatusColor(status)}`}>{status}</p>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Departure Info */}
          <div className="text-left">
            <p className="text-xl font-bold">{departureTime}</p>
            <p className="text-sm text-gray-600">{departureStation.name}</p>
            <p className="text-xs text-gray-500">{departureStation.city}, {departureStation.state}</p>
          </div>

          {/* Duration */}
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center gap-2">
              <FaClock className="text-gray-400" />
              <span className="text-sm text-gray-500">{duration}</span>
            </div>
            <div className="w-full h-0.5 bg-gray-200 relative my-2">
              <div className="absolute w-2 h-2 bg-gray-400 rounded-full -top-1 left-0" />
              <div className="absolute w-2 h-2 bg-gray-400 rounded-full -top-1 right-0" />
            </div>
          </div>

          {/* Arrival Info */}
          <div className="text-right">
            <p className="text-xl font-bold">{arrivalTime}</p>
            <p className="text-sm text-gray-600">{arrivalStation.name}</p>
            <p className="text-xs text-gray-500">{arrivalStation.city}, {arrivalStation.state}</p>
          </div>
        </div>

        {/* Classes and Fares */}
        <div className="w-full md:w-auto">
          <div className="flex flex-col gap-2">
            {availableClasses.map((cls) => (
              <div key={cls.code} className="flex items-center justify-between gap-4 text-sm">
                <span className="font-medium">{cls.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">₦{cls.baseFare}</span>
                  <span className="text-gray-500">({cls.availableSeats} seats)</span>
                </div>
              </div>
            ))}
          </div>
          {status === 'SCHEDULED' && (
            <Link 
              href={`/trains/review-booking?scheduleId=${schedule._id}&trainId=${train._id}&class=${selectedClass}&date=${date}`}
              className="mt-4 w-full block"
            >
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                Book Now
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
} 
"use client";
import React from 'react';
import { TrainScheduleCard } from './_components/TrainScheduleCard';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ScheduleWithDetails } from '../train-search/_types/train.types';

export default function TrainTimetablePage() {
  const searchParams = useSearchParams();
  const [schedules, setSchedules] = useState<ScheduleWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSchedules() {
      try {
        const params = new URLSearchParams(searchParams);
        const response = await fetch(`/api/schedules/search?${params.toString()}`);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch schedules');
        }

        setSchedules(data.data || []);
      } catch (err) {
        console.error('Error fetching schedules:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchSchedules();
  }, [searchParams]);

  // If no real schedules are found, use mock data
  const displaySchedules = schedules.length > 0 ? schedules : [
    {
      _id: "12430",
      trainNumber: "12430",
      trainName: "PH ENUGU Express",
      departureTime: "10:00",
      arrivalTime: "18:00",
      departureStation: {
        name: "Lagos Central",
        city: "Lagos",
      },
      arrivalStation: {
        name: "Ibadan Junction",
        city: "Ibadan",
      },
      duration: "8h 0m",
      availableClasses: [
        {
          _id: "1",
          name: "First Class AC",
          code: "1A",
          baseFare: 2000,
          availableSeats: 24,
        },
        {
          _id: "2",
          name: "Second Class AC",
          code: "2A",
          baseFare: 1500,
          availableSeats: 48,
        },
        {
          _id: "3",
          name: "Standard Class",
          code: "SC",
          baseFare: 300,
          availableSeats: 120,
        },
      ],
      status: "SCHEDULED",
    },
  ];

  const fromStation = searchParams.get('fromStationName') || 'Lagos';
  const toStation = searchParams.get('toStationName') || 'Ibadan';
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Train Timetable</h1>
        <p className="text-gray-600">{fromStation} → {toStation}</p>
        <p className="text-sm text-gray-500">
          Showing schedules for: {new Date(date).toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading schedules...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displaySchedules.map((schedule) => (
            <TrainScheduleCard
              key={schedule._id}
              trainNumber={schedule.trainNumber}
              trainName={schedule.trainName}
              departureTime={schedule.departureTime}
              arrivalTime={schedule.arrivalTime}
              departureStation={schedule.departureStation}
              arrivalStation={schedule.arrivalStation}
              duration={schedule.duration}
              availableClasses={schedule.availableClasses}
              status={schedule.status}
            />
          ))}
        </div>
      )}
    </div>
  );
}

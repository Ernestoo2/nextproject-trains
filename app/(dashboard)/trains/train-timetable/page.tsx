"use client";
import React from 'react';
import { TrainScheduleCard } from './_components/TrainScheduleCard';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ScheduleWithDetails } from '@/types/route.types';
import { FaSpinner } from 'react-icons/fa';

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

    if (searchParams.get('fromStationId') && searchParams.get('toStationId') && searchParams.get('date')) {
      fetchSchedules();
    } else {
      setLoading(false);
      setError('Please provide all required search parameters');
    }
  }, [searchParams]);

  const fromStation = searchParams.get('fromStationName') || 'Unknown Station';
  const toStation = searchParams.get('toStationName') || 'Unknown Station';
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
        <div className="flex justify-center items-center py-12">
          <FaSpinner className="animate-spin text-4xl text-green-600 mr-3" />
          <p className="text-gray-600">Loading schedules...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
        </div>
      ) : schedules.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No schedules found for this route and date.</p>
          <p className="text-sm text-gray-500 mt-2">Try selecting a different date or route.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {schedules.map((schedule) => (
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

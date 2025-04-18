import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { TrainScheduleCard } from '../../train-timetable/_components/TrainScheduleCard';
import { ScheduleWithDetails } from '../_types/train.types';

export default function TrainSearchTimetable() {
  const searchParams = useSearchParams();
  const [schedules, setSchedules] = useState<ScheduleWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        const fromStationId = searchParams.get('fromStationId');
        const toStationId = searchParams.get('toStationId');
        const date = searchParams.get('date');
        const classType = searchParams.get('classType');

        if (!fromStationId || !toStationId || !date) {
          setError('Missing required search parameters');
          return;
        }

        const response = await fetch(
          `/api/schedules/search?fromStationId=${fromStationId}&toStationId=${toStationId}&date=${date}${classType ? `&classType=${classType}` : ''}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch schedules');
        }

        const data = await response.json();
        if (data.success) {
          setSchedules(data.data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No schedules found for the selected criteria</p>
      </div>
    );
  }

  return (
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
          schedule={schedule} 
          selectedClass={schedule.selectedClass}
          date={schedule.date}
        />
      ))}
    </div>
  );
} 
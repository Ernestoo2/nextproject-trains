"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { TrainScheduleCard } from "../train-timetable/_components/TrainScheduleCard";
import { FaSpinner } from "react-icons/fa";
import DateSelector from "@/(dashboard)/_components/page-route/_components/rout-selectors/DateSelector";
import FromToSelector from "@/(dashboard)/_components/page-route/_components/rout-selectors/FromToSelector";
import PassengerClassSelector from "@/(dashboard)/_components/page-route/_components/rout-selectors/PassengerClassSelector";
import TripSelector from "@/(dashboard)/_components/page-route/_components/rout-selectors/TripSelector";
import { TRIP_TYPES, type TripType, type PassengerDetails, type TrainClass } from "@/types/shared/trains";
import type { ScheduleWithDetails } from "@/types/shared/trains";

export default function TrainSearchPage(): React.ReactElement {
  const [trainClasses, setTrainClasses] = React.useState<TrainClass[]>([]);
  const [schedules, setSchedules] = React.useState<ScheduleWithDetails[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [filters, setFilters] = React.useState({
    fromStation: "",
    toStation: "",
    date: new Date().toISOString().split("T")[0],
    tripType: "ONE_WAY" as TripType,
    classType: "ECONOMY",
    adultCount: 1,
    childCount: 0,
    infantCount: 0
  });

  // Fetch train classes on mount
  React.useEffect(() => {
    const fetchTrainClasses = async () => {
      try {
        const response = await fetch('/api/train-classes');
        if (!response.ok) {
          throw new Error('Failed to fetch train classes');
        }
        const data = await response.json();
        if (data.success && data.data?.trainClasses) {
          setTrainClasses(data.data.trainClasses);
        }
      } catch (error) {
        console.error('Error fetching train classes:', error);
      }
    };

    fetchTrainClasses();
  }, []);

  // Fetch schedules when filters change
  React.useEffect(() => {
    const fetchSchedules = async () => {
      if (!filters.fromStation || !filters.toStation || !filters.date) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/schedules?fromStation=${filters.fromStation}&toStation=${filters.toStation}&date=${filters.date}`
        );
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch schedules');
        }

        setSchedules(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch schedules');
        setSchedules([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedules();
  }, [filters.fromStation, filters.toStation, filters.date]);

  const handleTripTypeChange = (value: string): void => {
    if (Object.values(TRIP_TYPES).includes(value as TripType)) {
      setFilters(prev => ({ ...prev, tripType: value as TripType }));
    }
  };

  const handlePassengerCountChange = (details: Partial<PassengerDetails>): void => {
    setFilters(prev => ({
      ...prev,
      adultCount: details.adultCount ?? prev.adultCount,
      childCount: details.childCount ?? prev.childCount,
      infantCount: details.infantCount ?? prev.infantCount,
      classType: details.classType ?? prev.classType,
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Train Schedules</h1>
      
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FromToSelector
            stations={[]}
            selectedFrom={filters.fromStation}
            selectedTo={filters.toStation}
            onFromChange={(id: string) => setFilters(prev => ({ ...prev, fromStation: id }))}
            onToChange={(id: string) => setFilters(prev => ({ ...prev, toStation: id }))}
            date={filters.date}
            classType={filters.classType}
          />
          <div className="space-y-4">
            <DateSelector
              selectedDate={filters.date}
              onDateChange={(date: string) => setFilters(prev => ({ ...prev, date }))}
            />
            <PassengerClassSelector
              availableClasses={trainClasses}
              selectedClass={filters.classType}
              passengerCounts={{
                classType: filters.classType,
                adultCount: filters.adultCount,
                childCount: filters.childCount,
                infantCount: filters.infantCount
              }}
              onClassSelect={(classType: string) => setFilters(prev => ({ ...prev, classType }))}
              onPassengerCountChange={handlePassengerCountChange}
            />
            <TripSelector
              value={filters.tripType}
              onChange={handleTripTypeChange}
            />
          </div>
        </div>
      </Card>

      {isLoading ? (
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
          <p className="text-gray-600">
            {filters.fromStation && filters.toStation && filters.date
              ? "No schedules found for this route and date."
              : "Please select stations and date to view schedules."}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Try selecting a different date or route.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {schedules.map((schedule) => (
            <TrainScheduleCard
              key={schedule._id}
              schedule={schedule}
              selectedClass={filters.classType}
              date={filters.date}
            />
          ))}
        </div>
      )}
    </div>
  );
}
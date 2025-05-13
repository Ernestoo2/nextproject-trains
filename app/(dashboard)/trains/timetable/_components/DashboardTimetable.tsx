"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Schedule, Station } from "@/types/shared/trains";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertTriangle, Clock } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";

interface FilterState {
  fromStation: string;
  toStation: string;
  date: Date;
  status: string;
}

export function DashboardTimetable() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    fromStation: "",
    toStation: "",
    date: new Date(),
    status: "all",
  });

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch("/api/stations");
        const data = await response.json();
        if (Array.isArray(data.stations)) {
          setStations(data.stations);
        }
      } catch (err) {
        console.error("Error fetching stations:", err);
      }
    };

    fetchStations();
  }, []);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (filters.fromStation) {
          params.append("fromStationId", filters.fromStation);
        }
        if (filters.toStation) {
          params.append("toStationId", filters.toStation);
        }
        if (filters.date) {
          params.append(
            "date",
            format(filters.date || new Date(), "yyyy-MM-dd"),
          );
        }
        if (filters.status !== "all") {
          params.append("status", filters.status);
        }

        const url = `/api/schedules/search?${params.toString()}`;
        console.log("Fetching schedules from:", url);

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch schedules");
        }

        if (Array.isArray(data.schedules)) {
          setSchedules(data.schedules);
        } else {
          setSchedules([]);
        }
      } catch (err) {
        console.error("Error fetching schedules:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [filters]);

  const handleFilterChange = (
    key: keyof FilterState,
    value: string | Date | undefined,
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || (key === "date" ? new Date() : ""),
    }));
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-green-50 text-green-600";
      case "IN_PROGRESS":
        return "bg-blue-50 text-blue-600";
      case "COMPLETED":
        return "bg-gray-50 text-gray-600";
      case "CANCELLED":
        return "bg-red-50 text-red-600";
      case "DELAYED":
        return "bg-orange-50 text-orange-600";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Filter Schedules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              value={filters.fromStation}
              onValueChange={(value: string) =>
                handleFilterChange("fromStation", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="From Station" />
              </SelectTrigger>
              <SelectContent>
                {stations.map((station) => (
                  <SelectItem key={station._id} value={station._id}>
                    {station.stationName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.toStation}
              onValueChange={(value: string) =>
                handleFilterChange("toStation", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="To Station" />
              </SelectTrigger>
              <SelectContent>
                {stations.map((station) => (
                  <SelectItem key={station._id} value={station._id}>
                    {station.stationName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <DatePicker
              date={filters.date}
              setDate={(date) => handleFilterChange("date", date)}
            />

            <Select
              value={filters.status}
              onValueChange={(value: string) =>
                handleFilterChange("status", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="DELAYED">Delayed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {schedules.length === 0 ? (
        <div className="text-center p-8">
          No schedules found for the selected filters.
        </div>
      ) : (
        schedules.map((schedule) => {
          const trainInfo = typeof schedule.train === 'object' ? schedule.train : { trainName: '', trainNumber: '' };
          const routeInfo = typeof schedule.route === 'object' ? schedule.route : null;

          return (
            <Card key={schedule._id.toString()}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <span>
                      {trainInfo.trainName} ({trainInfo.trainNumber})
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={getStatusBadgeVariant(schedule.status)}
                      >
                        {schedule.status}
                      </Badge>
                      {schedule.platform && (
                        <Badge variant="outline" className="bg-blue-50">
                          Platform {schedule.platform}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {schedule.status === "DELAYED" && schedule.delayReason && (
                  <div className="flex items-center gap-2 text-orange-600 bg-orange-50 p-2 rounded-md mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <p className="text-sm">{schedule.delayReason}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">From</p>
                    <p className="font-semibold">
                      {typeof schedule.departureStation === 'string' 
                        ? schedule.departureStation 
                        : schedule.departureStation.stationName}
                    </p>
                    <div className="mt-1">
                      <p className="text-sm font-medium">{schedule.departureTime}</p>
                      {schedule.actualDepartureTime && (schedule.status === "DELAYED" || schedule.status === "IN_PROGRESS" || schedule.status === "COMPLETED") && (
                        <p className="text-sm text-orange-600">
                          Actual: {schedule.actualDepartureTime}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">To</p>
                    <p className="font-semibold">
                      {typeof schedule.arrivalStation === 'string' 
                        ? schedule.arrivalStation 
                        : schedule.arrivalStation.stationName}
                    </p>
                    <div className="mt-1">
                      <p className="text-sm font-medium">{schedule.arrivalTime}</p>
                      {schedule.actualArrivalTime && (schedule.status === "DELAYED" || schedule.status === "COMPLETED") && (
                        <p className="text-sm text-orange-600">
                          Actual: {schedule.actualArrivalTime}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration & Distance</p>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <p className="font-semibold">{schedule.duration}</p>
                    </div>
                    {routeInfo?.distance && (
                      <p className="text-sm text-gray-500 mt-1">
                        {routeInfo.distance} km
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Available Seats</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {schedule.availableClasses.map((cls) => (
                        <Badge key={cls.classCode} variant="outline">
                          {cls.className}: {cls.availableSeats}
                          <span className="ml-1 text-green-600">
                            (₦{cls.fare.toLocaleString()})
                          </span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}

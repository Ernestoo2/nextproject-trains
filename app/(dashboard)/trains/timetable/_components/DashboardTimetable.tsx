'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ISchedule, IStation } from '@/utils/mongodb/types';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'; 
import { Loader2 } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';

interface FilterState {
  fromStation: string;
  toStation: string;
  date: Date;
  status: string;
}

export function DashboardTimetable() {
  const [schedules, setSchedules] = useState<ISchedule[]>([]);
  const [stations, setStations] = useState<IStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    fromStation: '',
    toStation: '',
    date: new Date(),
    status: 'all'
  });

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch('/api/stations');
        if (!response.ok) {
          throw new Error('Failed to fetch stations');
        }
        const data = await response.json();
        setStations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stations');
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
          params.append('fromStationId', filters.fromStation);
        }
        if (filters.toStation) {
          params.append('toStationId', filters.toStation);
        }
        if (filters.date) {
          params.append('date', format(filters.date || new Date(), 'yyyy-MM-dd'));
        }
        if (filters.status !== 'all') {
          params.append('status', filters.status);
        }

        const url = `/api/schedules/search?${params.toString()}`;
        console.log('Fetching schedules from:', url);

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch schedules');
        }

        if (Array.isArray(data.schedules)) {
          setSchedules(data.schedules);
        } else {
          setSchedules([]);
        }
      } catch (err) {
        console.error('Error fetching schedules:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [filters]);

  const handleFilterChange = (key: keyof FilterState, value: string | Date | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || (key === 'date' ? new Date() : '')
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              value={filters.fromStation}
              onValueChange={(value: string) => handleFilterChange('fromStation', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="From Station" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Stations</SelectItem>
                {stations.map((station) => (
                  <SelectItem key={station._id} value={station._id}>
                    {station.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.toStation}
              onValueChange={(value: string) => handleFilterChange('toStation', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="To Station" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Stations</SelectItem>
                {stations.map((station) => (
                  <SelectItem key={station._id} value={station._id}>
                    {station.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <DatePicker
              date={filters.date}
              setDate={(date: Date | undefined) => handleFilterChange('date', date)}
            />

            <Select
              value={filters.status}
              onValueChange={(value: string) => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
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
        schedules.map((schedule) => (
          <Card key={schedule._id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>
                  {schedule.train.trainName} ({schedule.train.trainNumber})
                </span>
                <Badge variant={schedule.status === 'SCHEDULED' ? 'default' : 'secondary'}>
                  {schedule.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">From</p>
                  <p className="font-semibold">
                    {schedule.route.fromStation.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">To</p>
                  <p className="font-semibold">
                    {schedule.route.toStation.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Departure</p>
                  <p className="font-semibold">
                    {schedule.departureTime}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Arrival</p>
                  <p className="font-semibold">
                    {schedule.arrivalTime}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Available Seats</p>
                <div className="flex gap-2 mt-1">
                  {Object.entries(schedule.availableSeats).map(([className, seats]) => (
                    <Badge key={className} variant="outline">
                      {className}: {seats}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
} 
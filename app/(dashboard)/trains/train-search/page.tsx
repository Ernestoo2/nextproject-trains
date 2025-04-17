"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { StationRouteCard } from "./_components/StationRouteCard";
import { SearchParams, SearchResponse, ScheduleWithDetails } from "./_types/train.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

// Remove direct Mongoose imports
// import { Schedule } from '@/models/Schedule';
// import { connectDB } from "@/utils/mongodb/connect";

// Replace with API call
async function getSchedules(params: SearchParams): Promise<ScheduleWithDetails[]> {
  try {
    const { fromStationId, toStationId, date, classType } = params;
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (fromStationId) queryParams.append('fromStationId', fromStationId);
    if (toStationId) queryParams.append('toStationId', toStationId);
    if (date) queryParams.append('date', date);
    if (classType) queryParams.append('classType', classType);
    
    // Call the API
    const response = await fetch(`/api/schedules/search?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      console.error('API returned error:', data.message);
      return [];
    }
    
    return data.data || [];
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return [];
  }
}

export default function TrainSearchPage() {
  const searchParams = useSearchParams();
  const [schedules, setSchedules] = useState<ScheduleWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchSchedules() {
      setLoading(true);
      setError(null);
      
      try {
        const params: SearchParams = {
          fromStationId: searchParams.get('fromStationId') || '',
          toStationId: searchParams.get('toStationId') || '',
          date: searchParams.get('date') || new Date().toISOString().split('T')[0],
          classType: searchParams.get('classType') || '',
          adultCount: parseInt(searchParams.get('adultCount') || '1'),
          childCount: parseInt(searchParams.get('childCount') || '0'),
          infantCount: parseInt(searchParams.get('infantCount') || '0')
        };
        
        const results = await getSchedules(params);
        setSchedules(results);
      } catch (err) {
        console.error('Error fetching schedules:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }
    
    fetchSchedules();
  }, [searchParams]);
  
  const fromStationName = searchParams.get('fromStationName') || 'Unknown';
  const toStationName = searchParams.get('toStationName') || 'Unknown';
  const searchDate = searchParams.get('date') || new Date().toISOString().split('T')[0];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Search Results</h1>
      
      <div className="mb-4">
        <p className="text-gray-600">
          Showing trains from {fromStationName} to {toStationName} on{' '}
          {new Date(searchDate).toLocaleDateString()}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading schedules...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500">Error: {error}</p>
        </div>
      ) : schedules.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No trains found for this route and date.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {schedules.map((schedule) => (
            <Suspense key={schedule._id} fallback={<div>Loading...</div>}>
              <StationRouteCard schedule={schedule} />
            </Suspense>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { StationRouteCard } from "./_components/StationRouteCard";
import { SearchParams, SearchResponse, ScheduleWithDetails } from "./_types/train.types";
 import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
 import { Schedule } from '@/models/Schedule';
import { connectDB } from "@/utils/mongodb/connect";
async function getSchedules(params: SearchParams): Promise<ScheduleWithDetails[]> {
  try {
    await connectDB();
    
    const { from, to, date } = params;
    const searchDate = new Date(date);
    
    // Set time to start of day for date comparison
    searchDate.setHours(0, 0, 0, 0);
    
    const schedules = await Schedule.find({
      'fromStation.name': from,
      'toStation.name': to,
      date: {
        $gte: searchDate,
        $lt: new Date(searchDate.getTime() + 24 * 60 * 60 * 1000)
      },
      isActive: true
    })
    .populate('train')
    .populate('fromStation')
    .populate('toStation')
    .sort({ departureTime: 1 });

    return schedules as ScheduleWithDetails[];
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return [];
  }
}

export default async function TrainSearchPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const schedules = await getSchedules(searchParams);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Search Results</h1>
      
      <div className="mb-4">
        <p className="text-gray-600">
          Showing trains from {searchParams.from} to {searchParams.to} on{' '}
          {new Date(searchParams.date).toLocaleDateString()}
        </p>
      </div>

      {schedules.length === 0 ? (
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

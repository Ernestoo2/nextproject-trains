"use client";

import React from 'react';
import TrainSearchTimetable from './_components/TrainSearchTimetable';

export default function TrainSearchPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Train Schedules</h1>
      <TrainSearchTimetable />
    </div>
  );
}

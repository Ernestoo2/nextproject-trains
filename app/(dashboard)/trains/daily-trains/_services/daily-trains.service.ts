import { DailyTrainsResponse } from '../_types/daily-trains.types';

export async function getDailyTrains(): Promise<DailyTrainsResponse> {
  try {
    const response = await fetch('/api/trains/daily', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store' // Ensure we get fresh data each time
    });

    if (!response.ok) {
      throw new Error('Failed to fetch daily trains');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching daily trains:', error);
    return {
      success: false,
      data: [],
      message: 'Failed to fetch daily trains'
    };
  }
} 
import { useState, useEffect } from 'react';
// format from date-fns is no longer needed here if API provides correct format

interface ApiAvailableDate {
  date: string; // Expected to be 'yyyy-MM-dd' from API
}

interface UseAvailableDatesReturn {
  availableDates: string[]; // Storing as 'yyyy-MM-dd'
  isLoading: boolean;
  error: string | null;
}

export function useAvailableDates(): UseAvailableDatesReturn {
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAvailableDates = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/available-dates');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `Failed to fetch available dates (status: ${response.status})`);
        }

        if (!data.success) {
          throw new Error(data.error || 'API indicated failure but did not provide error message');
        }
        
        // Directly use the date strings from the API, assuming they are already 'yyyy-MM-dd'
        const datesFromApi = data.data.map((item: ApiAvailableDate) => item.date);
        setAvailableDates(datesFromApi);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching dates');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailableDates();
  }, []);

  // isDateAvailable function can be removed if DateSelector performs direct check
  // or kept if preferred for semantic clarity, but it would just be:
  // const isDateAvailable = (date: string): boolean => availableDates.includes(date);

  return {
    availableDates,
    isLoading,
    error,
  };
} 
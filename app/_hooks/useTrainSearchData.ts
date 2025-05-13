import { useEffect } from 'react';
import { useTrainSearchStore } from '@/store/trainSearchStore';
import { toast } from 'sonner';

export function useTrainSearchData() {
  const {
    setStations,
    setTrainClasses,
    setSearchResults,
    setLoading,
    setError,
    filters,
  } = useTrainSearchStore();

  // Fetch initial data (stations and train classes)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch stations
        const stationsResponse = await fetch('/api/stations');
        if (!stationsResponse.ok) {
          throw new Error(`Failed to fetch stations: ${stationsResponse.statusText}`);
        }
        const stationsData = await stationsResponse.json();
        if (!stationsData.success) {
          throw new Error(stationsData.error || 'Failed to fetch stations data');
        }
        setStations(stationsData.data.stations);

        // Fetch train classes
        const classesResponse = await fetch('/api/train-classes');
        if (!classesResponse.ok) {
          throw new Error(`Failed to fetch train classes: ${classesResponse.statusText}`);
        }
        const classesData = await classesResponse.json();
        if (!classesData.success) {
          throw new Error(classesData.error || 'Failed to fetch train classes data');
        }
        setTrainClasses(classesData);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [setStations, setTrainClasses, setLoading, setError]);

  // Fetch search results when filters change
  useEffect(() => {
    const fetchSearchResults = async () => {
      // Only search if we have the minimum required filters
      if (!filters.fromStation || !filters.toStation || !filters.date) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          from: filters.fromStation,
          to: filters.toStation,
          date: filters.date,
          ...(filters.classType && { class: filters.classType }),
          adults: filters.adultCount.toString(),
          children: filters.childCount.toString(),
          infants: filters.infantCount.toString(),
        });

        const response = await fetch(`/api/routes/search?${params.toString()}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch search results: ${response.statusText}`);
        }
        
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch search results data');
        }

        // Validate the response data
        if (!Array.isArray(data.data?.routes)) {
          throw new Error('Invalid search results format');
        }

        setSearchResults(data.data.routes);
        if (data.data.routes.length === 0) {
          toast.info('No routes found for the selected criteria');
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [filters, setSearchResults, setLoading, setError]);

  return null;
} 
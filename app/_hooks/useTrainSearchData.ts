import { useEffect } from 'react';
import { useTrainSearchStore } from '@/store/trainSearchStore';

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
        if (!stationsResponse.ok) throw new Error('Failed to fetch stations');
        const stationsData = await stationsResponse.json();
        setStations(stationsData.data.stations);

        // Fetch train classes
        const classesResponse = await fetch('/api/train-classes');
        if (!classesResponse.ok) throw new Error('Failed to fetch train classes');
        const classesData = await classesResponse.json();
        setTrainClasses(classesData.data);

      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred');
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

        const response = await fetch(`/api/routes/search?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch search results');
        
        const data = await response.json();
        setSearchResults(data.data.routes);

      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [filters, setSearchResults, setLoading, setError]);

  return null;
} 
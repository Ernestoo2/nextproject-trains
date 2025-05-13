import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTrainSearchStore } from '@/store/trainSearchStore';

export function useTrainSearchSync() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { filters, updateFilters } = useTrainSearchStore();

  // Sync URL to store on mount
  useEffect(() => {
    const params = {
      fromStation: searchParams.get('from') || '',
      toStation: searchParams.get('to') || '',
      date: searchParams.get('date') || '',
      classType: searchParams.get('class') || '',
      tripType: (searchParams.get('tripType') as any) || 'ONE_WAY',
      adultCount: Number(searchParams.get('adults')) || 1,
      childCount: Number(searchParams.get('children')) || 0,
      infantCount: Number(searchParams.get('infants')) || 0,
    };

    updateFilters(params);
  }, [searchParams, updateFilters]);

  // Update URL when filters change
  const updateUrl = (newFilters: Partial<typeof filters>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newFilters.fromStation) params.set('from', newFilters.fromStation);
    if (newFilters.toStation) params.set('to', newFilters.toStation);
    if (newFilters.date) params.set('date', newFilters.date);
    if (newFilters.classType) params.set('class', newFilters.classType);
    if (newFilters.tripType) params.set('tripType', newFilters.tripType);
    if (newFilters.adultCount) params.set('adults', newFilters.adultCount.toString());
    if (newFilters.childCount) params.set('children', newFilters.childCount.toString());
    if (newFilters.infantCount) params.set('infants', newFilters.infantCount.toString());

    router.replace(`?${params.toString()}`);
  };

  return {
    updateUrl,
  };
} 
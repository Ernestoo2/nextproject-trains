import { create } from 'zustand';
import type { Station, TrainClass, TripType, Route } from '@/types/shared/trains';

// Define the store's state shape
interface TrainSearchState {
  // Data
  stations: Station[];
  trainClasses: TrainClass[];
  searchResults: Route[];
  isLoading: boolean;
  error: string | null;

  // Filters (all optional for flexibility)
  filters: {
    fromStation: string;
    toStation: string;
    date: string;
    classType: string;
    tripType: TripType;
    adultCount: number;
    childCount: number;
    infantCount: number;
  };

  // Actions
  setStations: (stations: Station[]) => void;
  setTrainClasses: (classes: TrainClass[]) => void;
  setSearchResults: (results: Route[]) => void;
  updateFilters: (filters: Partial<TrainSearchState['filters']>) => void;
  resetFilters: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

// Initial state
const initialState = {
  stations: [],
  trainClasses: [],
  searchResults: [],
  isLoading: false,
  error: null,
  filters: {
    fromStation: '',
    toStation: '',
    date: '',
    classType: '',
    tripType: 'ONE_WAY' as TripType,
    adultCount: 1,
    childCount: 0,
    infantCount: 0,
  },
};

// Create the store
export const useTrainSearchStore = create<TrainSearchState>((set) => ({
  ...initialState,

  // Actions
  setStations: (stations) => set({ stations }),
  setTrainClasses: (trainClasses) => set({ trainClasses }),
  setSearchResults: (searchResults) => set({ searchResults }),
  
  updateFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  resetFilters: () =>
    set(() => ({
      filters: initialState.filters,
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
})); 
"use client";

import React, { createContext, useContext, useReducer, useCallback } from "react";
import { SearchFilters, DEFAULT_SEARCH_PARAMS } from "@/(dashboard)/_components/shared/SearchComponents";
import { ScheduleWithDetails } from "@/types/shared/trains";

interface TrainSearchState {
  filters: SearchFilters;
  results: {
    schedules: ScheduleWithDetails[];
    totalResults: number;
    page: number;
    limit: number;
  } | null;
  loading: boolean;
  error: string | null;
}

interface TrainSearchContextType {
  state: TrainSearchState;
  updateFilters: (filters: Partial<SearchFilters>) => void;
  searchTrains: () => Promise<void>;
  resetSearch: () => void;
  loadMore: () => Promise<void>;
}

const initialState: TrainSearchState = {
  filters: {
    ...DEFAULT_SEARCH_PARAMS,
    minPrice: 0,
    maxPrice: 3000,
    sortBy: "departureTime",
    sortOrder: "asc",
  },
  results: null,
  loading: false,
  error: null,
};

type Action =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_RESULTS"; payload: { schedules: ScheduleWithDetails[]; total: number } }
  | { type: "APPEND_RESULTS"; payload: { schedules: ScheduleWithDetails[]; total: number } }
  | { type: "UPDATE_FILTERS"; payload: Partial<SearchFilters> }
  | { type: "RESET_SEARCH" };

function searchReducer(state: TrainSearchState, action: Action): TrainSearchState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload, error: null };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "SET_RESULTS":
      return {
        ...state,
        results: {
          schedules: action.payload.schedules,
          totalResults: action.payload.total,
          page: 1,
          limit: state.filters.limit || 10,
        },
        loading: false,
        error: null,
      };
    case "APPEND_RESULTS":
      return {
        ...state,
        results: state.results ? {
          schedules: [...state.results.schedules, ...action.payload.schedules],
          totalResults: action.payload.total,
          page: (state.results.page || 1) + 1,
          limit: state.filters.limit || 10,
        } : {
          schedules: action.payload.schedules,
          totalResults: action.payload.total,
          page: 1,
          limit: state.filters.limit || 10,
        },
        loading: false,
        error: null,
      };
    case "UPDATE_FILTERS":
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
        // Reset results when filters change
        results: action.payload.page ? state.results : null,
      };
    case "RESET_SEARCH":
      return initialState;
    default:
      return state;
  }
}

const TrainSearchContext = createContext<TrainSearchContextType | undefined>(undefined);

export function TrainSearchProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(searchReducer, initialState);

  const updateFilters = useCallback((filters: Partial<SearchFilters>) => {
    dispatch({ type: "UPDATE_FILTERS", payload: filters });
  }, []);

  const searchTrains = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const { filters } = state;

      // Validate required fields
      if (!filters.fromStation || !filters.toStation || !filters.date) {
        throw new Error("Please select departure and arrival stations and date");
      }

      // Convert filters to a record of strings
      const params: Record<string, string> = {
        fromStation: filters.fromStation,
        toStation: filters.toStation,
        date: filters.date,
        classType: filters.classType,
        page: "1", // Reset to first page on new search
        adultCount: filters.adultCount.toString(),
        childCount: filters.childCount.toString(),
        infantCount: filters.infantCount.toString(),
        minPrice: (filters.minPrice ?? 0).toString(),
        maxPrice: (filters.maxPrice ?? 3000).toString(),
      };

      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.sortOrder) params.sortOrder = filters.sortOrder;
      if (filters.limit) params.limit = filters.limit.toString();

      const searchParams = new URLSearchParams(params);

      const response = await fetch(`/api/schedules/search?${searchParams}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch schedules");
      }

      dispatch({
        type: "SET_RESULTS",
        payload: {
          schedules: data.data.schedules,
          total: data.data.totalResults,
        }
      });
    } catch (error) {
      console.error("Error searching trains:", error);
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Failed to search trains",
      });
    }
  }, [state.filters]);

  const loadMore = useCallback(async () => {
    if (!state.results || state.loading) return;

    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const { filters } = state;
      const nextPage = (state.results.page || 1) + 1;

      // Convert filters to a record of strings
      const params: Record<string, string> = {
        fromStation: filters.fromStation,
        toStation: filters.toStation,
        date: filters.date,
        classType: filters.classType,
        page: nextPage.toString(),
        adultCount: filters.adultCount.toString(),
        childCount: filters.childCount.toString(),
        infantCount: filters.infantCount.toString(),
        minPrice: (filters.minPrice ?? 0).toString(),
        maxPrice: (filters.maxPrice ?? 3000).toString(),
      };

      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.sortOrder) params.sortOrder = filters.sortOrder;
      if (filters.limit) params.limit = filters.limit.toString();

      const searchParams = new URLSearchParams(params);

      const response = await fetch(`/api/schedules/search?${searchParams}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load more schedules");
      }

      dispatch({
        type: "APPEND_RESULTS",
        payload: {
          schedules: data.data.schedules,
          total: data.data.totalResults,
        }
      });
    } catch (error) {
      console.error("Error loading more trains:", error);
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Failed to load more trains",
      });
    }
  }, [state.results, state.loading, state.filters]);

  const resetSearch = useCallback(() => {
    dispatch({ type: "RESET_SEARCH" });
  }, []);

  return (
    <TrainSearchContext.Provider
      value={{
        state,
        updateFilters,
        searchTrains,
        resetSearch,
        loadMore,
      }}
    >
      {children}
    </TrainSearchContext.Provider>
  );
}

export function useTrainSearch() {
  const context = useContext(TrainSearchContext);
  if (context === undefined) {
    throw new Error("useTrainSearch must be used within a TrainSearchProvider");
  }
  return context;
}
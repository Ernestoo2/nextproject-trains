import { Types } from "mongoose";
import { BaseApiResponse } from "./api";
import { TrainClassType, ScheduleWithDetails } from "./trains";

//app/types/shared/searchApi.ts

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface SortOption {
  field: string;
  direction: "asc" | "desc";
}

export interface BaseSearchParams {
  fromStation?: string;
  toStation?: string;
  date?: string;
  classType?: TrainClassType;
  adultCount?: number;
  childCount?: number;
  infantCount?: number;
}

export interface TrainSearchFilters extends BaseSearchParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  minPrice?: number;
  maxPrice?: number;
}

export interface TrainSearchResults {
  schedules: ScheduleWithDetails[];
  totalResults: number;
  page: number;
  limit: number;
}

export interface TrainSearchState {
  filters: TrainSearchFilters;
  results: TrainSearchResults | null;
  loading: boolean;
  error: string | null;
}

export interface TrainSearchContextType {
  state: TrainSearchState;
  updateFilters: (filters: Partial<TrainSearchFilters>) => void;
  searchTrains: () => Promise<void>;
  resetSearch: () => void;
}

export interface SearchResponse {
  success: boolean;
  data: {
    schedules: ScheduleWithDetails[];
    totalResults: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
  fromStation: {
    id: string;
    name: string;
    code: string;
    city: string;
    state: string;
  };
  toStation: {
    id: string;
    name: string;
    code: string;
    city: string;
    state: string;
  };
}

export interface BookingSearchFilters extends BaseSearchParams {
  userId?: Types.ObjectId;
  pnr?: string;
  status?: string[];
  paymentStatus?: string[];
  trainNumber?: string;
}

export interface UserSearchFilters extends BaseSearchParams {
  email?: string;
  phone?: string;
  isVerified?: boolean;
  documentType?: string;
  membershipTier?: string[];
}

export interface AutocompleteResponse extends BaseApiResponse {
  data: Array<{
    id: string;
    type: "STATION" | "TRAIN" | "CITY";
    text: string;
    code?: string;
    metadata?: Record<string, any>;
  }>;
}

export interface SearchSuggestion {
  type: "RECENT" | "POPULAR" | "TRENDING";
  text: string;
  metadata?: Record<string, any>;
  weight?: number;
}

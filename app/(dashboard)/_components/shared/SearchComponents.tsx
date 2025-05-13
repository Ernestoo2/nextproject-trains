 

// Export common types and interfaces
export interface SearchParams {
  fromStation: string;
  toStation: string;
  date: string;
  classType: string;
  adultCount: number;
  childCount: number;
  infantCount: number;
  page?: number;
  limit?: number;
  tripType: "ONE_WAY" | "ROUND_TRIP";
}

export interface SearchFilters extends SearchParams {
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const DEFAULT_SEARCH_PARAMS: SearchParams = {
  fromStation: "",
  toStation: "",
  date: new Date().toISOString().split("T")[0],
  classType: "SC",
  adultCount: 1,
  childCount: 0,
  infantCount: 0,
  page: 1,
  limit: 10,
  tripType: "ONE_WAY",
};

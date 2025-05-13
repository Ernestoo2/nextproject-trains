import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import type { Booking } from "@/types/shared/database";
import type { ApiResponse } from "@/types/shared/api";
import { toast } from "sonner";
import { Passenger } from "@/types/shared/trains";

const DEFAULT_FARE_DETAILS = {
  perPersonFare: 0,
  baseTicketFare: 0,
  taxes: 0,
  totalFare: 0,
};

const initialState: Booking = {
  _id: "" as any,
  userId: "" as any,
  scheduleId: "" as any,
  createdAt: new Date(),
  updatedAt: new Date(),
  isActive: true,
  pnr: "",
  status: "DRAFT",
  paymentStatus: "PENDING",
  passengers: [],
  selectedClass: "",
  availableSeats: {},
  schedule: null,
  
  // Fare related fields
  totalPrice: 0,
  baseFare: 0,
  taxes: 0,
  promoDiscount: 0,
  
  // Offer flags
  has20PercentOffer: false,
  has50PercentOffer: false,
  
  // Detailed fare breakdown
  fareDetails: DEFAULT_FARE_DETAILS,
};

interface UseBookingStateReturn {
  state: Booking;
  isLoading: boolean;
  error: string | null;
  updateState: (updates: Partial<Booking>) => Promise<void>;
  initializeState: (initialData: Partial<Booking>) => Promise<void>;
}

export function useBookingState(bookingId: string): UseBookingStateReturn {
  const { data: session } = useSession();
  const [state, setState] = useState<Booking>(initialState);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial state
  useEffect(() => {
    if (!session?.user || !bookingId) {
      setError("User session or booking ID not found");
      setIsLoading(false);
      return;
    }

    const fetchState = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/booking/${bookingId}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch booking: ${response.statusText}`);
        }

        const data: ApiResponse<Booking> = await response.json();
        if (!data.success || !data.data) {
          throw new Error(data.error || 'Failed to fetch booking data');
        }

        // Validate and transform the data
        const bookingData = data.data;
        setState({
          ...initialState,
          ...bookingData,
          passengers: bookingData.passengers || [],
          schedule: bookingData.schedule || null,
          fareDetails: bookingData.fareDetails || DEFAULT_FARE_DETAILS,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch booking state';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchState();
  }, [bookingId, session?.user]);

  // Update state
  const updateState = useCallback(
    async (updates: Partial<Booking>): Promise<void> => {
      if (!session?.user || !bookingId) {
        toast.error('User session or booking ID not found');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Validate updates before sending
        const validatedUpdates = {
          ...updates,
          passengers: updates.passengers || state.passengers,
          fareDetails: {
            ...(state.fareDetails || DEFAULT_FARE_DETAILS),
            ...(updates.fareDetails || {}),
          },
        };

        const response = await fetch(`/api/booking/${bookingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(validatedUpdates),
        });

        if (!response.ok) {
          throw new Error(`Failed to update booking: ${response.statusText}`);
        }

        const data: ApiResponse<Booking> = await response.json();
        if (!data.success || !data.data) {
          throw new Error(data.error || 'Failed to update booking data');
        }

        setState((prevState: Booking) => ({
          ...prevState,
          ...data.data,
          passengers: data.data.passengers || prevState.passengers,
          fareDetails: data.data.fareDetails || prevState.fareDetails,
        }));

        toast.success('Booking updated successfully');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update booking state';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [bookingId, session?.user, state.passengers, state.fareDetails]
  );

  // Initialize state
  const initializeState = useCallback(
    async (initialData: Partial<Booking>): Promise<void> => {
      if (!session?.user || !bookingId) {
        toast.error('User session or booking ID not found');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Validate initial data
        const validatedData = {
          ...initialState,
          ...initialData,
          passengers: initialData.passengers || [],
          fareDetails: {
            ...DEFAULT_FARE_DETAILS,
            ...(initialData.fareDetails || {}),
          },
        };

        const response = await fetch(`/api/booking/${bookingId}/initialize`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(validatedData),
        });

        if (!response.ok) {
          throw new Error(`Failed to initialize booking: ${response.statusText}`);
        }

        const data: ApiResponse<Booking> = await response.json();
        if (!data.success || !data.data) {
          throw new Error(data.error || 'Failed to initialize booking data');
        }

        setState({
          ...initialState,
          ...data.data,
          passengers: data.data.passengers || [],
          fareDetails: data.data.fareDetails || DEFAULT_FARE_DETAILS,
        });

        toast.success('Booking initialized successfully');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize booking state';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [bookingId, session?.user]
  );

  return {
    state,
    isLoading,
    error,
    updateState,
    initializeState,
  };
}

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { BookingState, Passenger } from "@/types/shared";
 
const initialState: BookingState = {
  totalPrice: 0,
  baseFare: 0,
  taxes: 0,
  has20PercentOffer: false,
  has50PercentOffer: false,
  promoDiscount: 0,
  passengers: [] as Passenger[],
  selectedClass: "ECONOMY",
  availableSeats: {} as Record<string, number>,
  schedule: undefined,
  fareDetails: {
    perPersonFare: 0,
    baseTicketFare: 0,
    taxes: 0,
    totalFare: 0,
  },
};

interface UseBookingStateReturn {
  state: BookingState;
  isLoading: boolean;
  error: string | null;
  updateState: (updates: Partial<BookingState>) => Promise<void>;
  initializeState: (initialData: Partial<BookingState>) => Promise<void>;
}

export function useBookingState(bookingId: string): UseBookingStateReturn {
  const { data: session } = useSession();
  const [state, setState] = useState<BookingState>({
    ...initialState,
    passengers: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial state
  useEffect(() => {
    if (!session?.user || !bookingId) return;

    const fetchState = async (): Promise<void> => {
      try {
        const response = await fetch(`/api/booking?bookingId=${bookingId}`);
        const data = await response.json();
        if (data.error) {
          setError(data.error);
        } else {
          setState({
            ...initialState,
            ...data.data,
            passengers: data.data?.passengers || [],
          });
        }
      } catch (err) {
        setError("Failed to fetch booking state");
      } finally {
        setIsLoading(false);
      }
    };

    fetchState();
  }, [bookingId, session?.user]);

  // Update state
  const updateState = useCallback(
    async (updates: Partial<BookingState>): Promise<void> => {
      if (!session?.user || !bookingId) return;

      try {
        const response = await fetch("/api/booking", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bookingId,
            updates: {
              ...updates,
              passengers: updates.passengers || state.passengers,
            },
          }),
        });

        const data = await response.json();
        if (data.error) {
          setError(data.error);
        } else {
          setState((prevState: BookingState) => ({
            ...prevState,
            ...data.data,
            passengers: data.data?.passengers || prevState.passengers,
          }));
        }
      } catch (err) {
        setError("Failed to update booking state");
      }
    },
    [bookingId, session?.user, state.passengers]
  );

  // Initialize state
  const initializeState = useCallback(
      async (initialData: Partial<BookingState>): Promise<void> => {
      if (!session?.user || !bookingId) return;

      try {
        const response = await fetch("/api/booking", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bookingId,
            state: {
              ...initialState,
              ...initialData,
              passengers: initialData.passengers || [],
            },
          }),
        });

        const data = await response.json();
        if (data.error) {
          setError(data.error);
        } else {
          setState({
            ...initialState,
            ...data.data,
            passengers: data.data?.passengers || [],
          });
        }
      } catch (err) {
        setError("Failed to initialize booking state");
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

import { create } from 'zustand';
import type { 
  Route, 
  Schedule, 
  Passenger,
  TrainClassType,
  BookingState as TrainBookingState,
  BookingAction,
  BookingStage,
  Booking,
  PromoCode
} from '@/types/shared/trains';

interface ExtendedBookingState extends TrainBookingState {
  baseFare: number;
  taxes: number;
  discount: number;
  totalAmount: number;
  appliedPromoCode?: string;
}

interface BookingStoreState {
  // Selected route and schedule
  selectedRoute: Route | null;
  selectedSchedule: Schedule | null;
  
  // Booking state
  bookingState: ExtendedBookingState;
  stage: BookingStage;
  
  // Loading and error states
  isLoading: boolean;
  error: string | null;
  
  // Actions
  actions: {
    selectRoute: (route: Route) => void;
    selectSchedule: (schedule: Schedule) => void;
    addPassenger: (passenger: Passenger) => void;
    removePassenger: (index: number) => void;
    updateClass: (classType: TrainClassType) => void;
    applyPromoCode: (code: string) => Promise<void>;
    removePromoCode: () => Promise<void>;
    calculateFare: (baseFare: number, passengerCount: number) => void;
    setBookingDetails: (details: Partial<Booking>) => void;
    resetBooking: () => void;
  };
}

// Initial state
const initialState: Omit<BookingStoreState, 'actions'> = {
  selectedRoute: null,
  selectedSchedule: null,
  bookingState: {
    passengers: [],
    selectedClass: 'STANDARD' as TrainClassType,
    has20PercentOffer: false,
    has50PercentOffer: false,
    totalFare: 0,
    baseFare: 0,
    taxes: 0,
    discount: 0,
    totalAmount: 0
  },
  stage: 'ROUTE_SELECTION',
  isLoading: false,
  error: null
};

// Create the store
export const useBookingStore = create<BookingStoreState>((set) => ({
  ...initialState,

  actions: {
    selectRoute: (route) => 
      set((state) => ({
        selectedRoute: route,
        stage: 'PASSENGER_DETAILS'
      })),

    selectSchedule: (schedule) =>
      set((state) => ({
        selectedSchedule: schedule,
        stage: 'SEAT_SELECTION'
      })),

    addPassenger: (passenger) =>
      set((state) => ({
        bookingState: {
          ...state.bookingState,
          passengers: [...state.bookingState.passengers, passenger]
        }
      })),

    removePassenger: (index) =>
      set((state) => ({
        bookingState: {
          ...state.bookingState,
          passengers: state.bookingState.passengers.filter((_, i) => i !== index)
        }
      })),

    updateClass: (classType) =>
      set((state) => ({
        bookingState: {
          ...state.bookingState,
          selectedClass: classType
        }
      })),

    applyPromoCode: async (code) => {
      try {
        // Here you would typically validate the promo code with your backend
        const response = await fetch('/api/promo/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        });

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message || 'Invalid promo code');
        }

        set((state) => ({
          bookingState: {
            ...state.bookingState,
            appliedPromoCode: code,
            discount: data.discount || 0,
            totalAmount: state.bookingState.totalAmount - (state.bookingState.totalAmount * (data.discount || 0))
          }
        }));
      } catch (error) {
        throw error;
      }
    },

    removePromoCode: async () => {
      set((state) => ({
        bookingState: {
          ...state.bookingState,
          appliedPromoCode: undefined,
          discount: 0,
          totalAmount: state.bookingState.baseFare + state.bookingState.taxes
        }
      }));
    },

    calculateFare: (baseFare, passengerCount) =>
      set((state) => {
        const totalBaseFare = baseFare * passengerCount;
        const taxes = totalBaseFare * 0.18; // 18% tax
        const totalAmount = totalBaseFare + taxes;

        return {
          bookingState: {
            ...state.bookingState,
            baseFare: totalBaseFare,
            taxes,
            totalAmount
          }
        };
      }),

    setBookingDetails: (details) =>
      set((state) => ({
        bookingState: {
          ...state.bookingState,
          bookingDetails: details
        }
      })),

    resetBooking: () => set(initialState)
  }
})); 
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

interface BookingStoreState {
  // Selected route and schedule
  selectedRoute: Route | null;
  selectedSchedule: Schedule | null;
  
  // Booking state
  bookingState: TrainBookingState;
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
    applyPromo: (code: PromoCode) => void;
    toggle20PercentOffer: () => void;
    toggle50PercentOffer: () => void;
    calculateTotal: (amount: number) => void;
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
    totalFare: 0
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

    applyPromo: (code) =>
      set((state) => ({
        bookingState: {
          ...state.bookingState,
          promoCode: code
        }
      })),

    toggle20PercentOffer: () =>
      set((state) => ({
        bookingState: {
          ...state.bookingState,
          has20PercentOffer: !state.bookingState.has20PercentOffer
        }
      })),

    toggle50PercentOffer: () =>
      set((state) => ({
        bookingState: {
          ...state.bookingState,
          has50PercentOffer: !state.bookingState.has50PercentOffer
        }
      })),

    calculateTotal: (amount) =>
      set((state) => ({
        bookingState: {
          ...state.bookingState,
          totalFare: amount
        }
      })),

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
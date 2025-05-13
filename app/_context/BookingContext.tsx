import { ReactNode, createContext, useContext, useReducer } from "react";
import { ApiResponse } from "@/types/shared/api";
import { Booking, Payment, Schedule } from "@/types/shared/database";
import { Passenger } from "@/types/shared/trains";

interface BookingState {
  selectedSchedule?: Schedule;
  passengers: Passenger[];
  selectedClass?: string;
  totalFare: number;
  promoCode?: string;
  currentBooking?: Booking;
  paymentStatus?: string;
  isLoading: boolean;
  error?: string;
}

type BookingAction =
  | { type: 'SET_SCHEDULE'; payload: Schedule }
  | { type: 'ADD_PASSENGER'; payload: Passenger }
  | { type: 'REMOVE_PASSENGER'; payload: number }
  | { type: 'SET_CLASS'; payload: string }
  | { type: 'SET_FARE'; payload: number }
  | { type: 'SET_PROMO'; payload: string }
  | { type: 'SET_CURRENT_BOOKING'; payload: Booking }
  | { type: 'SET_PAYMENT_STATUS'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_BOOKING' }
  | { type: 'SET_BOOKING_DATA'; payload: { schedule: Schedule; passengers: Passenger[]; classType: string } }
  | { type: 'SET_PAYMENT_METHOD'; payload: { method: string } };

interface BookingContextType {
  state: BookingState;
  dispatch: React.Dispatch<BookingAction>;
  calculateFare: () => void;
  validateBooking: () => boolean;
  createBooking: () => Promise<ApiResponse<Booking>>;
  processPayment: (paymentData: Partial<Payment>) => Promise<ApiResponse<Payment>>;
}

const initialState: BookingState = {
  passengers: [],
  totalFare: 0,
  isLoading: false
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'SET_SCHEDULE':
      return { ...state, selectedSchedule: action.payload };
    case 'ADD_PASSENGER':
      return { ...state, passengers: [...state.passengers, action.payload] };
    case 'REMOVE_PASSENGER':
      return {
        ...state,
        passengers: state.passengers.filter((_, index) => index !== action.payload)
      };
    case 'SET_CLASS':
      return { ...state, selectedClass: action.payload };
    case 'SET_FARE':
      return { ...state, totalFare: action.payload };
    case 'SET_PROMO':
      return { ...state, promoCode: action.payload };
    case 'SET_CURRENT_BOOKING':
      return { ...state, currentBooking: action.payload };
    case 'SET_PAYMENT_STATUS':
      return { ...state, paymentStatus: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: undefined };
    case 'RESET_BOOKING':
      return { ...initialState };
    case 'SET_BOOKING_DATA': {
      const { schedule, passengers, classType } = action.payload;
      return { ...state, selectedSchedule: schedule, passengers, selectedClass: classType };
    }
    case 'SET_PAYMENT_METHOD': {
      const { method } = action.payload;
      // If you want to store payment method, add it to BookingState
      return state; // No-op for now
    }
    default:
      return state;
  }
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  const calculateFare = () => {
    if (!state.selectedSchedule || !state.selectedClass) return;
    // Assume selectedSchedule.availableClasses is an array of { class: string, fare: number }
    const classDetails = (state.selectedSchedule as any).availableClasses?.find(
      (c: any) => c.class === state.selectedClass
    );
    if (!classDetails) return;
    const baseFare = classDetails.fare;
    const passengerCount = state.passengers.length;
    const subtotal = baseFare * passengerCount;
    const taxes = subtotal * 0.18; // 18% tax
    const total = subtotal + taxes;
    dispatch({ type: 'SET_FARE', payload: total });
  };

  const validateBooking = (): boolean => {
    if (!state.selectedSchedule) {
      dispatch({ type: 'SET_ERROR', payload: 'No schedule selected' });
      return false;
    }
    if (!state.selectedClass) {
      dispatch({ type: 'SET_ERROR', payload: 'No class selected' });
      return false;
    }
    if (state.passengers.length === 0) {
      dispatch({ type: 'SET_ERROR', payload: 'No passengers added' });
      return false;
    }
    return true;
  };

  const createBooking = async (): Promise<ApiResponse<Booking>> => {
    if (!validateBooking()) {
      return { success: false, status: 400, message: state.error || 'Invalid booking data', error: state.error || 'Invalid booking data' };
    }
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduleId: (state.selectedSchedule as any)?._id,
          class: state.selectedClass,
          passengers: state.passengers,
          totalFare: state.totalFare,
          promoCode: state.promoCode
        }),
      });
      const data: ApiResponse<Booking> = await response.json();
      if (data.success && data.data) {
        dispatch({ type: 'SET_CURRENT_BOOKING', payload: data.data });
      } else {
        dispatch({ type: 'SET_ERROR', payload: data.message || 'Failed to create booking' });
      }
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create booking';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, status: 500, message: errorMessage, error: errorMessage };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const processPayment = async (paymentData: Partial<Payment>): Promise<ApiResponse<Payment>> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });
      const data: ApiResponse<Payment> = await response.json();
      if (data.success && data.data) {
        dispatch({ type: 'SET_PAYMENT_STATUS', payload: data.data.status });
      } else {
        dispatch({ type: 'SET_ERROR', payload: data.message || 'Failed to process payment' });
      }
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process payment';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, status: 500, message: errorMessage, error: errorMessage };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const value = {
    state,
    dispatch,
    calculateFare,
    validateBooking,
    createBooking,
    processPayment,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}

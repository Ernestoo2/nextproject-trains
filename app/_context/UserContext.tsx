import { ReactNode, createContext, useContext, useReducer } from "react";
import { ApiResponse, ApiSuccessResponse, ApiErrorResponse } from "@/types/shared/api";
import { Booking, Payment } from "@/types/shared/database";

//app/_context/UserContext.tsx

interface UserState {
  bookings: Booking[];
  payments: Payment[];
  isLoading: boolean;
  error?: string;
}

type UserAction =
  | { type: 'SET_BOOKINGS'; payload: Booking[] }
  | { type: 'ADD_BOOKING'; payload: Booking }
  | { type: 'UPDATE_BOOKING'; payload: Booking }
  | { type: 'SET_PAYMENTS'; payload: Payment[] }
  | { type: 'ADD_PAYMENT'; payload: Payment }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

interface UserContextType {
  state: UserState;
  dispatch: React.Dispatch<UserAction>;
  fetchUserBookings: () => Promise<ApiSuccessResponse<Booking[]> | ApiErrorResponse>;
  fetchUserPayments: () => Promise<ApiSuccessResponse<Payment[]> | ApiErrorResponse>;
  createBooking: (bookingData: Partial<Booking>) => Promise<ApiSuccessResponse<Booking> | ApiErrorResponse>;
  updateBooking: (bookingId: string, updateData: Partial<Booking>) => Promise<ApiSuccessResponse<Booking> | ApiErrorResponse>;

  createPayment: (paymentData: Partial<Payment>) => Promise<ApiSuccessResponse<Payment> | ApiErrorResponse>;
}

const initialState: UserState = {
  bookings: [],
  payments: [],
  isLoading: false
};

const UserContext = createContext<UserContextType | undefined>(undefined);

function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case 'SET_BOOKINGS':
      return { ...state, bookings: action.payload };
    case 'ADD_BOOKING':
      return { ...state, bookings: [...state.bookings, action.payload] };
    case 'UPDATE_BOOKING':
      return {
        ...state,
        bookings: state.bookings.map(booking =>
          booking._id === action.payload._id ? action.payload : booking
        )
      };
    case 'SET_PAYMENTS':
      return { ...state, payments: action.payload };
    case 'ADD_PAYMENT':
      return { ...state, payments: [...state.payments, action.payload] };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: undefined };
    default:
      return state;
  }
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(userReducer, initialState);

  const fetchUserBookings = async (): Promise<ApiSuccessResponse<Booking[]> | ApiErrorResponse> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch('/api/booking');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        dispatch({ type: 'SET_BOOKINGS', payload: data.data || [] });
        return {
          success: true,
          data: data.data,
          message: 'Bookings fetched successfully',
          status: response.status
        };
      } else {
        const errorMessage = data.error || 'Failed to fetch bookings';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        return {
          success: false,
          error: errorMessage,
          message: 'Failed to fetch bookings',
          status: response.status
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch bookings';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return {
        success: false,
        error: errorMessage,
        message: 'An error occurred while fetching bookings',
        status: 500
      };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const fetchUserPayments = async (): Promise<ApiSuccessResponse<Payment[]> | ApiErrorResponse> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch('/api/payments');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        dispatch({ type: 'SET_PAYMENTS', payload: data.data || [] });
        return {
          success: true,
          data: data.data,
          message: 'Payments fetched successfully',
          status: response.status
        };
      } else {
        const errorMessage = data.error || 'Failed to fetch payments';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        return {
          success: false,
          error: errorMessage,
          message: 'Failed to fetch payments',
          status: response.status
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch payments';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return {
        success: false,
        error: errorMessage,
        message: 'An error occurred while fetching payments',
        status: 500
      };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createBooking = async (bookingData: Partial<Booking>): Promise<ApiSuccessResponse<Booking> | ApiErrorResponse> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success && data.data) {
        dispatch({ type: 'ADD_BOOKING', payload: data.data });
        return {
          success: true,
          data: data.data,
          message: 'Booking created successfully',
          status: response.status
        };
      } else {
        const errorMessage = data.error || 'Failed to create booking';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        return {
          success: false,
          error: errorMessage,
          message: 'Failed to create booking',
          status: response.status
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create booking';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return {
        success: false,
        error: errorMessage,
        message: 'An error occurred while creating booking',
        status: 500
      };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateBooking = async (
    bookingId: string,
    updateData: Partial<Booking>
  ): Promise<ApiSuccessResponse<Booking> | ApiErrorResponse> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch(`/api/booking/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success && data.data) {
        dispatch({ type: 'UPDATE_BOOKING', payload: data.data });
        return {
          success: true,
          data: data.data,
          message: 'Booking updated successfully',
          status: response.status
        };
      } else {
        const errorMessage = data.error || 'Failed to update booking';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        return {
          success: false,
          error: errorMessage,
          message: 'Failed to update booking',
          status: response.status
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update booking';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return {
        success: false,
        error: errorMessage,
        message: 'An error occurred while updating booking',
        status: 500
      };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createPayment = async (
    paymentData: Partial<Payment>
  ): Promise<ApiSuccessResponse<Payment> | ApiErrorResponse> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success && data.data) {
        dispatch({ type: 'ADD_PAYMENT', payload: data.data });
        return {
          success: true,
          data: data.data,
          message: 'Payment processed successfully',
          status: response.status
        };
      } else {
        const errorMessage = data.error || 'Failed to process payment';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        return {
          success: false,
          error: errorMessage,
          message: 'Failed to process payment',
          status: response.status
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process payment';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return {
        success: false,
        error: errorMessage,
        message: 'An error occurred while processing payment',
        status: 500
      };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const value = {
    state,
    dispatch,
    fetchUserBookings,
    fetchUserPayments,
    createBooking,
    updateBooking,
    createPayment,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
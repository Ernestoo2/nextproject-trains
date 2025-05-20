import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode, 
} from "react";
import { 
  Passenger as ITraveler,
  Booking as IBookingDetails, 
  TrainClassType,
  PromoCode,
  TRAIN_CLASSES,
} from "@/types/shared/trains";


// Discriminated union for booking status
type BookingStatus =
  | { status: 'INITIAL' }
  | { status: 'SELECTING_PASSENGERS' }
  | { status: 'SELECTING_CLASS' }
  | { status: 'APPLYING_PROMO' }
  | { status: 'CALCULATING_FARE' }
  | { status: 'READY_TO_BOOK' }
  | { status: 'BOOKING_ERROR'; error: string };

// Types
interface IBookingState {
  bookingStatus: BookingStatus;
  passengers: ITraveler[];
  bookingDetails: Partial<IBookingDetails>;
  selectedClass: TrainClassType;
  promoCode?: PromoCode;
  has20PercentOffer: boolean;
  has50PercentOffer: boolean;
  totalFare: number;
}

// Discriminated union for actions
type BookingActionType =
  | { type: "ADD_PASSENGER"; payload: ITraveler }
  | { type: "REMOVE_PASSENGER"; payload: number }
  | { type: "UPDATE_BOOKING_DETAILS"; payload: Partial<IBookingDetails> }
  | { type: "UPDATE_CLASS"; payload: TrainClassType }
  | { type: "APPLY_PROMO"; payload: PromoCode }
  | { type: "CALCULATE_TOTAL"; payload: number }
  | { type: "SET_BOOKING_STATUS"; payload: BookingStatus };

interface IBookingContextType {
  state: IBookingState;
  addPassenger: (passenger: ITraveler) => void;
  removePassenger: (index: number) => void;
  updateBookingDetails: (details: Partial<IBookingDetails>) => void;
  updateClass: (classType: TrainClassType) => void;
  applyPromo: (code: PromoCode) => void;
  calculateTotal: (total: number) => void;
  setBookingStatus: (status: BookingStatus) => void;
}

const BookingContext = createContext<IBookingContextType | undefined>(
  undefined
);

type Props = {
  children: ReactNode;
};

const initialState: IBookingState = {
  bookingStatus: { status: 'INITIAL' },
  passengers: [],
  selectedClass: TRAIN_CLASSES.ECONOMY,
  has20PercentOffer: false,
  has50PercentOffer: false,
  totalFare: 0,
  bookingDetails: {
    schedule: "",
    trainClass: "",
    totalFare: 0,
    status: "SCHEDULED",
    pnr: "",
    paymentStatus: "PENDING",
    baseFare: 0,
    taxes: 0,
    promoDiscount: 0
  }
};

const bookingReducer = (
  state: IBookingState,
  action: BookingActionType
): IBookingState => {
  switch (action.type) {
    case "ADD_PASSENGER":
      return {
        ...state,
        passengers: [...state.passengers, action.payload],
        bookingStatus: { status: 'SELECTING_PASSENGERS' }
      };
    case "REMOVE_PASSENGER":
      return {
        ...state,
        passengers: state.passengers.filter(
          (_, index) => index !== action.payload
        ),
        bookingStatus: state.passengers.length === 1
          ? { status: 'INITIAL' }
          : { status: 'SELECTING_PASSENGERS' }
      };
    case "UPDATE_BOOKING_DETAILS":
      return {
        ...state,
        bookingDetails: {
          ...state.bookingDetails,
          ...action.payload,
        },
        bookingStatus: { status: 'SELECTING_CLASS' }
      };
    case "UPDATE_CLASS":
      return {
        ...state,
        selectedClass: action.payload,
        bookingStatus: { status: 'CALCULATING_FARE' }
      };
    case "APPLY_PROMO":
      return {
        ...state,
        promoCode: action.payload,
        bookingStatus: { status: 'APPLYING_PROMO' }
      };
    case "CALCULATE_TOTAL":
      return {
        ...state,
        totalFare: action.payload,
        bookingStatus: { status: 'READY_TO_BOOK' }
      };
    case "SET_BOOKING_STATUS":
      return {
        ...state,
        bookingStatus: action.payload
      };
    default:
      return state;
  }
};

export function BookingProvider({ children }: Props) {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  const addPassenger = (passenger: ITraveler) => {
    dispatch({ type: "ADD_PASSENGER", payload: passenger });
  };

  const removePassenger = (index: number) => {
    dispatch({ type: "REMOVE_PASSENGER", payload: index });
  };

  const updateBookingDetails = (details: Partial<IBookingDetails>) => {
    dispatch({ type: "UPDATE_BOOKING_DETAILS", payload: details });
  };

  const updateClass = (classType: TrainClassType) => {
    dispatch({ type: "UPDATE_CLASS", payload: classType });
  };

  const applyPromo = (code: PromoCode) => {
    dispatch({ type: "APPLY_PROMO", payload: code });
  };

  const calculateTotal = (total: number) => {
    dispatch({ type: "CALCULATE_TOTAL", payload: total });
  };

  const setBookingStatus = (status: BookingStatus) => {
    dispatch({ type: "SET_BOOKING_STATUS", payload: status });
  };

  const value = {
    state,
    addPassenger,
    removePassenger,
    updateBookingDetails,
    updateClass,
    applyPromo,
    calculateTotal,
    setBookingStatus,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
}

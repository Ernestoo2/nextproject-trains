import { create } from 'zustand';
import type { 
  Route,  
  Passenger,
  TrainClassType,
  BookingState as TrainBookingState, 
  BookingStage,
  Booking, 
} from '@/types/shared/trains';
import type { ScheduleWithDetails } from '@/types/shared/database';

interface ExtendedBookingState extends TrainBookingState {
  baseFare: number;
  taxes: number;
  discount: number;
  totalAmount: number;
  appliedPromoCode?: string;
  currentDefaultClassId: string | null;
  scheduleDetails: ScheduleWithDetails | null;
}

interface BookingStoreState {
  selectedRoute: Route | null;
  bookingState: ExtendedBookingState;
  stage: BookingStage;
  isLoading: boolean;
  error: string | null;
  actions: {
    selectRoute: (route: Route) => void;
    selectScheduleAndClass: (schedule: ScheduleWithDetails, defaultClassId: string) => void;
    addPassenger: (passenger: Passenger) => void;
    removePassenger: (index: number) => void;
    updatePassengerClass: (passengerIndex: number, newClassId: string) => void;
    updateCurrentDefaultClass: (classId: string) => void;
    applyPromoCode: (code: string) => Promise<void>;
    removePromoCode: () => Promise<void>;
    recalculateBookingTotals: () => void;
    setBookingDetails: (details: Partial<Booking>) => void;
    resetBooking: () => void;
  };
}

const TAX_RATE = 0.08;

const initialState: Omit<BookingStoreState, 'actions'> = {
  selectedRoute: null,
  bookingState: {
    passengers: [],
    selectedClass: 'STANDARD',
    promoCode: undefined,
    has20PercentOffer: false,
    has50PercentOffer: false,
    totalFare: 0,
    bookingDetails: undefined,
    currentDefaultClassId: null,
    scheduleDetails: null,
    baseFare: 0,
    taxes: 0,
    discount: 0,
    totalAmount: 0,
    appliedPromoCode: undefined
  },
  stage: 'ROUTE_SELECTION',
  isLoading: false,
  error: null
};

export const useBookingStore = create<BookingStoreState>((set, get) => ({
  ...initialState,

  actions: {
    selectRoute: (route) => 
      set(() => ({
        selectedRoute: route,
        stage: 'PASSENGER_DETAILS'
      })),

    selectScheduleAndClass: (schedule, defaultClassId) => {
      set((state) => ({
        bookingState: {
          ...state.bookingState,
          scheduleDetails: schedule,
          currentDefaultClassId: defaultClassId,
          selectedClass: schedule.availableClasses.find(c => c.classCode === defaultClassId)?.classType as TrainClassType || state.bookingState.selectedClass,
        },
        stage: 'SEAT_SELECTION'
      }));
      get().actions.recalculateBookingTotals();
    },

    updateCurrentDefaultClass: (classId) => {
      set(state => ({
        bookingState: {
          ...state.bookingState,
          currentDefaultClassId: classId,
          selectedClass: state.bookingState.scheduleDetails?.availableClasses.find(c => c.classCode === classId)?.classType as TrainClassType || state.bookingState.selectedClass,
        }
      }));
    },

    addPassenger: (passenger) => {
      set((state) => ({
        bookingState: {
          ...state.bookingState,
          passengers: [...state.bookingState.passengers, passenger]
        }
      }));
      get().actions.recalculateBookingTotals();
    },

    removePassenger: (index) => {
      set((state) => ({
        bookingState: {
          ...state.bookingState,
          passengers: state.bookingState.passengers.filter((_, i) => i !== index)
        }
      }));
      get().actions.recalculateBookingTotals();
    },

    updatePassengerClass: (passengerIndex, newClassId) => {
      set(state => {
        const updatedPassengers = state.bookingState.passengers.map((p, index) => 
          index === passengerIndex ? { ...p, selectedClassId: newClassId } : p
        );
        return {
          bookingState: {
            ...state.bookingState,
            passengers: updatedPassengers
          }
        };
      });
      get().actions.recalculateBookingTotals();
    },

    applyPromoCode: async (code) => {
      const discountAmount = code === "BOOKNOW" ? 50 : code === "FIRSTTIME" ? 100 : 0;

      if (discountAmount > 0) {
        set((state) => ({
          bookingState: {
            ...state.bookingState,
            appliedPromoCode: code,
            discount: discountAmount
          }
        }));
        get().actions.recalculateBookingTotals();
      } else {
        console.warn("Invalid promo code applied or no discount");
      }
    },

    removePromoCode: async () => {
      set((state) => ({
        bookingState: {
          ...state.bookingState,
          appliedPromoCode: undefined,
          discount: 0
        }
      }));
      get().actions.recalculateBookingTotals();
    },

    recalculateBookingTotals: () =>
      set((state) => {
        const { scheduleDetails, passengers, discount } = state.bookingState;

        let totalCalculatedBaseFare = 0;
        let totalCalculatedTaxes = 0;

        if (scheduleDetails && scheduleDetails.availableClasses) {
          passengers.forEach(passenger => {
            const passengerClass = scheduleDetails.availableClasses.find(
              cls => cls.classCode === passenger.selectedClassId || cls._id === passenger.selectedClassId
            );
            
            if (passengerClass) {
              totalCalculatedBaseFare += passengerClass.fare || passengerClass.baseFare || 0;
            } else {
              console.warn(`Class ${passenger.selectedClassId} not found in available classes. Available classes:`, 
                scheduleDetails.availableClasses.map(c => ({ code: c.classCode, id: c._id }))
              );
              const defaultClass = scheduleDetails.availableClasses[0];
              if (defaultClass) {
                totalCalculatedBaseFare += defaultClass.fare || defaultClass.baseFare || 0;
              }
            }
          });
          
          totalCalculatedTaxes = totalCalculatedBaseFare * TAX_RATE;
        } else {
          console.warn("[Store Action - recalculateBookingTotals] Cannot recalculate totals: Missing scheduleDetails or availableClasses");
        }
        
        let newTotalAmount = totalCalculatedBaseFare + totalCalculatedTaxes - (discount || 0);
        newTotalAmount = Math.max(0, newTotalAmount);

        return {
          bookingState: {
            ...state.bookingState,
            baseFare: totalCalculatedBaseFare,
            taxes: totalCalculatedTaxes,
            totalAmount: newTotalAmount,
            totalFare: newTotalAmount
          }
        };
      }),

    setBookingDetails: () =>
      set((state) => {
        
        return state;
      }),

    resetBooking: () => set(initialState)
  }
})); 
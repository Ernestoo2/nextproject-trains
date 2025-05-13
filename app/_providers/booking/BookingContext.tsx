"use client";

import React, { createContext, useContext, useReducer, ReactNode, useCallback } from "react";
import type { BookingState, BookingAction, Passenger } from "@/types/booking.types";

const initialState: BookingState = {
  passengers: [],
  selectedClass: "",
  has20PercentOffer: false,
  has50PercentOffer: false,
  totalFare: 0,
};

const PROMO_CODES: Record<string, number> = {
  WELCOME20: 0.2,
  WELCOME10: 0.1,
  SEASONAL50: 0.5,
};

const BookingContext = createContext<
  | {
      state: BookingState;
      addPassenger: (passenger: Passenger) => void;
      removePassenger: (index: number) => void;
      updateSelectedClass: (classCode: string) => void;
      calculateTotal: (baseFare: number) => void;
      toggle20PercentOffer: () => void;
      toggle50PercentOffer: () => void;
      applyPromoCode: (code: string) => void;
    }
  | undefined
>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  const addPassenger = (passenger: Passenger) => {
    dispatch({ type: "ADD_PASSENGER", payload: passenger });
  };

  const removePassenger = (index: number) => {
    dispatch({ type: "REMOVE_PASSENGER", payload: index });
  };

  const updateSelectedClass = (classCode: string) => {
    dispatch({ type: "UPDATE_CLASS", payload: classCode });
  };

  const calculateTotal = useCallback((baseFare: number) => {
    const taxes = baseFare * 0.18;
    let totalFare = baseFare + taxes;
    if (state.has20PercentOffer) {
      totalFare -= baseFare * 0.2;
    }
    if (state.has50PercentOffer) {
      totalFare -= baseFare * 0.5;
    }
    // If promoCode is set, apply discount
    if (state.promoCode && PROMO_CODES[state.promoCode]) {
      const discount = PROMO_CODES[state.promoCode];
      totalFare -= baseFare * discount;
    }
    dispatch({ type: "CALCULATE_TOTAL", payload: totalFare });
  }, [state.has20PercentOffer, state.has50PercentOffer, state.promoCode]);

  const toggle20PercentOffer = () => {
    dispatch({ type: "TOGGLE_20_PERCENT_OFFER" });
  };

  const toggle50PercentOffer = () => {
    dispatch({ type: "TOGGLE_50_PERCENT_OFFER" });
  };

  const applyPromoCode = (code: string) => {
    dispatch({ type: "APPLY_PROMO", payload: code as any });
  };

  return (
    <BookingContext.Provider
      value={{
        state,
        addPassenger,
        removePassenger,
        toggle20PercentOffer,
        toggle50PercentOffer,
        applyPromoCode,
        calculateTotal,
        updateSelectedClass,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

function bookingReducer(
  state: BookingState,
  action: BookingAction
): BookingState {
  switch (action.type) {
    case "ADD_PASSENGER":
      return {
        ...state,
        passengers: [...state.passengers, action.payload],
      };
    case "REMOVE_PASSENGER":
      return {
        ...state,
        passengers: state.passengers.filter((_, index) => index !== action.payload),
      };
    case "UPDATE_CLASS":
      return {
        ...state,
        selectedClass: action.payload,
      };
    case "CALCULATE_TOTAL":
      return {
        ...state,
        totalFare: action.payload,
      };
    case "TOGGLE_20_PERCENT_OFFER":
      return {
        ...state,
        has20PercentOffer: !state.has20PercentOffer,
      };
    case "TOGGLE_50_PERCENT_OFFER":
      return {
        ...state,
        has50PercentOffer: !state.has50PercentOffer,
      };
    case "APPLY_PROMO":
      return {
        ...state,
        promoCode: action.payload,
      };
    case "SET_BOOKING_DETAILS":
      return {
        ...state,
        bookingDetails: action.payload,
      };
    default:
      return state;
  }
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
}

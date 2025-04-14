"use client";

import React, { createContext, useContext, useState } from "react";
import { BookingDetails } from "../_types/paystack.types";

type PaymentContextType = {
  bookingDetails: BookingDetails | null;
  setBookingDetails: React.Dispatch<React.SetStateAction<BookingDetails | null>>;
};

const PaymentContext = createContext<PaymentContextType>({
  bookingDetails: null,
  setBookingDetails: () => null,
});

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);

  const value = {
    bookingDetails,
    setBookingDetails,
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};

export function usePayment(): PaymentContextType {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error("usePayment must be used within a PaymentProvider");
  }
  return context;
} 
import React, { createContext, useContext, useState, useEffect } from 'react';

interface Traveler {
  id: string;
  name: string;
  age: number;
  gender: string;
  berthPreference: string;
}

interface BookingState {
  travelers: Traveler[];
  has20PercentOffer: boolean;
  baseFare: number;
  taxes: number;
  total: number;
  discount: number;
  finalTotal: number;
}

interface BookingContextType {
  bookingState: BookingState;
  addTraveler: (traveler: Omit<Traveler, 'id'>) => void;
  updateTraveler: (id: string, updates: Partial<Traveler>) => void;
  removeTraveler: (id: string) => void;
  toggle20PercentOffer: () => void;
  calculateFares: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [bookingState, setBookingState] = useState<BookingState>({
    travelers: [],
    has20PercentOffer: false,
    baseFare: 0,
    taxes: 0,
    total: 0,
    discount: 0,
    finalTotal: 0,
  });

  const addTraveler = (traveler: Omit<Traveler, 'id'>) => {
    const newTraveler: Traveler = {
      id: Date.now().toString(),
      ...traveler,
    };
    setBookingState(prev => ({
      ...prev,
      travelers: [...prev.travelers, newTraveler],
    }));
  };

  const updateTraveler = (id: string, updates: Partial<Traveler>) => {
    setBookingState(prev => ({
      ...prev,
      travelers: prev.travelers.map(traveler =>
        traveler.id === id ? { ...traveler, ...updates } : traveler
      ),
    }));
  };

  const removeTraveler = (id: string) => {
    setBookingState(prev => ({
      ...prev,
      travelers: prev.travelers.filter(traveler => traveler.id !== id),
    }));
  };

  const toggle20PercentOffer = () => {
    setBookingState(prev => ({
      ...prev,
      has20PercentOffer: !prev.has20PercentOffer,
    }));
  };

  const calculateFares = () => {
    const baseFare = 5000; // Example base fare
    const taxRate = 0.1; // 10% tax
    const discountRate = bookingState.has20PercentOffer ? 0.2 : 0; // 20% discount if offer is applied

    const totalBaseFare = baseFare * bookingState.travelers.length;
    const taxes = totalBaseFare * taxRate;
    const total = totalBaseFare + taxes;
    const discount = total * discountRate;
    const finalTotal = total - discount;

    setBookingState(prev => ({
      ...prev,
      baseFare: totalBaseFare,
      taxes,
      total,
      discount,
      finalTotal,
    }));
  };

  useEffect(() => {
    calculateFares();
  }, [bookingState.travelers.length, bookingState.has20PercentOffer]);

  return (
    <BookingContext.Provider
      value={{
        bookingState,
        addTraveler,
        updateTraveler,
        removeTraveler,
        toggle20PercentOffer,
        calculateFares,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
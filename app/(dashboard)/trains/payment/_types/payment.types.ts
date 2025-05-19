import { Passenger } from "@/types/shared";

export interface IPaystackPopProps {
  email: string;
  amount: number;
  metadata: {
    bookingDetails: IBookingPaymentDetails;
  };
  publicKey: string;
  text: string;
  onSuccess: (reference: string) => void;
  onClose: () => void;
}

export interface IPaymentStation {
  name: string;
  code: string;
}

export interface IBookingPaymentDetails {
  scheduleId: string;
  trainName: string;
  trainNumber: string;
  departureStationName: string;
  arrivalStationName: string;
  departureTime: string;
  arrivalTime: string;
  journeyDate: string;
  selectedClass: string;
  passengers: Passenger[];
  fareDetails: {
    baseFare: number;
    taxes: number;
    discount: number;
    totalAmount: number;
    promoCode?: string;
  };
  has20PercentOffer?: boolean;
  has50PercentOffer?: boolean;
}

export interface IPaymentResponse {
  reference: string;
  trans: string;
  status: string;
  message: string;
  transaction: string;
  trxref: string;
}

export interface IPaymentContextType {
  paymentDetails: IBookingPaymentDetails | null;
  setPaymentDetails: (details: IBookingPaymentDetails) => void;
  processPayment: (reference: string) => Promise<void>;
  isProcessing: boolean;
  error: string | null;
}

declare global {
  interface Window {
    PaystackPop: new () => {
      newTransaction: (config: IPaystackPopProps) => void;
    };
  }
}

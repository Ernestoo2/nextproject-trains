import { IPassenger } from "../../review-booking/_types/shared.types";
import { IStation } from "../../_types/shared.types";
import { ISchedule } from "../../daily-trains/_types/schedule.types";

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
  trainId: string;
  trainNumber: string;
  trainName: string;
  departureStation: IPaymentStation;
  arrivalStation: IPaymentStation;
  departureTime: string;
  arrivalTime: string;
  class: string;
  baseFare: number;
  taxes: number;
  promoDiscount: number;
  has20PercentOffer: boolean;
  has50PercentOffer: boolean;
  totalPrice: number;
  date: string;
  passengers: IPassenger[];
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

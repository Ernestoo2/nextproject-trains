import { IBookingPaymentDetails } from "./payment.types";

export interface BookingDetails {
  scheduleId: string;
  trainId: string;
  trainNumber: string;
  trainName: string;
  departureStation: {
    name: string;
    code: string;
    city: string;
    state: string;
  };
  arrivalStation: {
    name: string;
    code: string;
    city: string;
    state: string;
  };
  departureTime: string;
  arrivalTime: string;
  class: string;
  baseFare: number;
  taxAndGST: number;
  promoDiscount: number;
  totalPrice: number;
  date: string;
}

export interface IPaystackConfig {
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

export interface IPaystackHandler {
  openIframe: () => void;
}

export interface IPaystackInstance {
  setup: (config: IPaystackConfig) => IPaystackHandler;
}

export interface PaystackResponse {
  reference: string;
  trans: string;
  status: string;
  message: string;
  transaction: string;
  trxref: string;
}

export interface PaymentContextType {
  bookingDetails: BookingDetails | null;
  setBookingDetails: (details: BookingDetails) => void;
}

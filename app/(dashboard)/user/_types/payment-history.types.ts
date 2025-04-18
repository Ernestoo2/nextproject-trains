export interface PaymentHistory {
  id: string;
  userId: string;
  amount: number;
  date: string;
  status: "completed" | "pending" | "failed";
  method: string;
  bookingId: string;
  reference: string;
  metadata?: {
    trainNumber?: string;
    departureStation?: string;
    arrivalStation?: string;
    class?: string;
  };
}

export interface PaymentHistoryResponse {
  success: boolean;
  payments: PaymentHistory[];
  message?: string;
} 
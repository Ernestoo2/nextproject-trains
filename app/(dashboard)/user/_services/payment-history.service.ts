import { PaymentHistory } from "../_types/payment-history.types";

export async function savePaymentHistory(payment: PaymentHistory): Promise<boolean> {
  try {
    const response = await fetch('/api/payments/history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payment),
    });

    if (!response.ok) {
      throw new Error('Failed to save payment history');
    }

    return true;
  } catch (error) {
    console.error('Error saving payment history:', error);
    return false;
  }
}

export async function getPaymentHistory(userId: string): Promise<PaymentHistory[]> {
  try {
    const response = await fetch(`/api/payments/history?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payment history');
    }

    const data = await response.json();
    return data.payments;
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return [];
  }
} 
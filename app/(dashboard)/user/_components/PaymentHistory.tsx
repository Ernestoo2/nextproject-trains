"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react"; 
import { getPaymentHistory } from "../_services/payment-history.service";
import { Card } from "@/components/ui/card";
import {
  Clock,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface Paymenthistories {
  id: string;
  amount: number;
  method: string;
  date: string;
  status: "completed" | "pending" | "failed";
  metadata?: {
    trainNumber?: string;
    departureStation?: string;
    arrivalStation?: string;
    class?: string;
  };
}

interface PaymentHistoryProps {
  userId?: string;
  onPaymentUpdate?: () => void;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ userId, onPaymentUpdate }) => {
  const { data: session } = useSession();
  const [payments, setPayments] = useState<Paymenthistories[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    const currentUserId = session?.user?.id || userId;
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/payments/history?userId=${currentUserId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch payment history");
      }
      const data = await response.json();
      if (data.success) {
        setPayments(data.payments);
      } else {
        throw new Error(data.message || "Failed to fetch payment history");
      }
    } catch (error) {
      console.error("Error fetching payment history:", error);
      setError(error instanceof Error ? error.message : "Failed to load payment history");
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, userId]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  useEffect(() => {
    if (onPaymentUpdate) {
      fetchPayments();
    }
  }, [onPaymentUpdate, fetchPayments]);

  if (!session?.user && !userId) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-600">
        <AlertCircle className="h-8 w-8 mr-2" />
        <p>{error}</p>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Payment History</h2>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">No payment history found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Payment History</h2>
      <div className="grid gap-4">
        {payments.map((payment) => (
          <Card
            key={payment.id}
            className="p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium">
                    ₦{payment.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">{payment.method}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">
                  {new Date(payment.date).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {payment.status === "completed" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : payment.status === "pending" ? (
                  <Loader2 className="h-5 w-5 animate-spin text-yellow-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <span
                  className={`text-sm ${
                    payment.status === "completed"
                      ? "text-green-600"
                      : payment.status === "pending"
                        ? "text-yellow-600"
                        : "text-red-600"
                  }`}
                >
                  {payment.status.charAt(0).toUpperCase() +
                    payment.status.slice(1)}
                </span>
              </div>

              {payment.metadata && (
                <div className="text-sm text-gray-600">
                  <p>{payment.metadata.trainNumber}</p>
                  <p>
                    {payment.metadata.departureStation} →{" "}
                    {payment.metadata.arrivalStation}
                  </p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PaymentHistory;

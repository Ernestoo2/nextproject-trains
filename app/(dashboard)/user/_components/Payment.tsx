"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { PaymentHistory } from "../_types/payment-history.types";
import { getPaymentHistory } from "../_services/payment-history.service";
import { Card } from "@/components/ui/card";
import {
  Clock,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

// Payment.tsx

interface PaymentProps {
  userId?: string;
  onPaymentUpdate?: () => void;
}

export default function Payment({ userId, onPaymentUpdate }: PaymentProps) {
  const { data: session } = useSession();
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      const currentUserId = session?.user?.id || userId;
      if (!currentUserId) {
        setLoading(false);
        return;
      }

      try {
        const history = await getPaymentHistory(currentUserId);
        setPayments(history);
      } catch {
        setError("Failed to load payment history");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [session?.user?.id, userId, onPaymentUpdate]);

  if (!session?.user && !userId) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Please log in to view payment history</p>
      </div>
    );
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
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">No payment history found</p>
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
}

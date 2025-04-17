"use client";

import React from "react";
import { useSession } from "next-auth/react";

// Payment.tsx

interface Payment {
  id: string;
  amount: number;
  date: string;
  status: "completed" | "pending" | "failed";
  method: string;
}

interface PaymentProps {
  userId?: string;
}

export default function Payment({ userId }: PaymentProps) {
  const { data: session } = useSession();

  // Mock data - replace with actual API call
  const payments: Payment[] = [
    {
      id: "1",
      amount: 5000,
      date: "2024-03-15",
      status: "completed",
      method: "Card",
    },
    {
      id: "2",
      amount: 7500,
      date: "2024-03-10",
      status: "pending",
      method: "Bank Transfer",
    },
  ];

  if (!session?.user && !userId) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Payment History</h2>
      <div className="space-y-4">
        {payments.map((payment) => (
          <div key={payment.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">
                  ₦{payment.amount.toLocaleString()}
                </p>
                <p className="text-gray-600">{payment.method}</p>
                <p className="text-sm text-gray-500">{payment.date}</p>
              </div>
              <span
                className={`px-2 py-1 rounded text-sm ${
                  payment.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : payment.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {payment.status.charAt(0).toUpperCase() +
                  payment.status.slice(1)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

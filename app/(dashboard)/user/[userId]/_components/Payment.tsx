'use client';

import React, { useState } from "react";
import Image from 'next/image';

interface PaymentMethod {
  id: number;
  name: string;
  icon: string;
  description: string;
  isSelected: boolean;
}

interface PaymentProps {
  onMethodSelect: (id: number) => void;
}

const Payment: React.FC<PaymentProps> = ({ onMethodSelect }) => {
  const [methods, setMethods] = useState<PaymentMethod[]>([
    {
      id: 1,
      name: "Credit Card",
      icon: "/Assets/credit-card.png",
      description: "Pay with your credit card",
      isSelected: false,
    },
    {
      id: 2,
      name: "PayPal",
      icon: "/Assets/paypal.png",
      description: "Pay with PayPal",
      isSelected: false,
    },
    {
      id: 3,
      name: "Bank Transfer",
      icon: "/Assets/bank.png",
      description: "Direct bank transfer",
      isSelected: false,
    },
  ]);

  const handleMethodSelect = (id: number) => {
    setMethods(methods.map(method => ({
      ...method,
      isSelected: method.id === id
    })));
    onMethodSelect(id);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Payment Methods</h2>
      <div className="space-y-4">
        {methods.map((method) => (
          <div
            key={method.id}
            className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
              method.isSelected ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleMethodSelect(method.id)}
          >
            <div className="w-12 h-12 relative mr-4">
              <Image
                src={method.icon}
                alt={`${method.name} icon`}
                fill
                className="object-contain"
              />
            </div>
            <div>
              <p className="font-semibold">{method.name}</p>
              <p className="text-sm text-gray-600">{method.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Payment; 
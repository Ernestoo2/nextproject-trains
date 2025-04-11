import React from "react";

// Payment.tsx

interface PaymentMethod {
  id: number;
  name: string;
  icon: string; // URL or icon component
  description: string;
  isSelected: boolean;
}

interface PaymentProps {
  methods: PaymentMethod[];
  onMethodSelect: (id: number) => void;
}

const Payment: React.FC<PaymentProps> = ({ methods, onMethodSelect }) => {
  return (
    <div className="w-full  h-auto">
      <h2 className="mb-4 text-lg font-bold">Payment Methods</h2>
      <div className="space-y-4">
        {methods.map((method) => (
          <div
            key={method.id}
            className={`flex items-center p-4 border rounded ${
              method.isSelected ? "border-green-500" : "border-gray-300"
            }`}
            onClick={() => onMethodSelect(method.id)}
          >
            <img
              src={method.icon}
              alt={`${method.name} icon`}
              className="w-32 h-20 mr-4"
            />
            <div>
              <p className="font-bold">{method.name}</p>
              <p className="text-gray-600">{method.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Payment;

import Payment from "./Payment";
import React, { useState } from "react";

const ParentComponent: React.FC = () => {
  const [methods, setMethods] = useState([
    {
      id: 1,
      name: "Credit Card",
      icon: "/Assets/creditcard.png",
      description: "Pay with your credit card.",
      isSelected: false,
    },
    {
      id: 2,
      name: "PayPal",
      icon: "/Assets/paypal.jpeg",
      description: "Pay via PayPal.",
      isSelected: false,
    },
  ]);

  const handleMethodSelect = (id: number) => {
    setMethods((prev) =>
      prev.map((method) =>
        method.id === id
          ? { ...method, isSelected: true }
          : { ...method, isSelected: false },
      ),
    );
  };

  return <Payment methods={methods} onMethodSelect={handleMethodSelect} />;
};

export default ParentComponent;

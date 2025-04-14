import { useState } from "react";
import { FaTrain } from "react-icons/fa";
import {
  ClassTypes,
  PassengerCount,
} from "../../../../../../../clones/transport-system/src/utils/types/types";

export default function PassengerClassSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedClass, setSelectedClass] =
    useState<keyof ClassTypes>("Economy");
  const [passengerCount, setPassengerCount] = useState<PassengerCount>({
    adults: 0,
    children: 0,
    infants: 0,
    total: 0,
  });

  const [classPassengerTotals, setClassPassengerTotals] = useState<ClassTypes>({
    Economy: 0,
    Business: 0,
    FirstClass: 0,
    Total: 0,
  });

  const HandlePassengerUpdate = (
    passengerType: keyof Omit<PassengerCount, "total">,
    classType: keyof ClassTypes,
    change: number,
  ) => {
    setPassengerCount((prev) => {
      const updatedCount = Math.max(0, prev[passengerType] + change);
      const newTotal =
        prev.adults +
        prev.children +
        prev.infants -
        prev[passengerType] +
        updatedCount;

      return {
        ...prev,
        [passengerType]: updatedCount,
        total: newTotal,
      };
    });

    setClassPassengerTotals((prev) => {
      const updatedTotal = Math.max(0, prev[classType] + change);
      const newGrandTotal =
        prev.Economy +
        prev.Business +
        prev.FirstClass -
        prev[classType] +
        updatedTotal;

      return {
        ...prev,
        [classType]: updatedTotal,
        Total: newGrandTotal,
      };
    });
  };

  return (
    <div className="relative border border-[#79747E] p-3 rounded-md flex items-center gap-3 text-sm">
      <span className="absolute -top-2 left-3 bg-slate-100 px-1 text-xs text-[#79747E]">
        Passenger - Class
      </span>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full relative p-1 rounded-md flex items-center gap-3 text-sm"
      >
        <span className="font-medium">
          {passengerCount.total} Passenger
          {passengerCount.total > 1 ? "s" : ""} - {selectedClass}
        </span>
        <FaTrain className="text-[#79747E] ml-auto" />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20">
          <div className="p-4">
            <div className="mb-4">
              <p className="text-xs text-[#79747E] mb-2">Passengers:</p>
              {Object.keys(passengerCount).map(
                (key) =>
                  key !== "total" && (
                    <div key={key} className="flex items-center mb-2">
                      <span className="w-20 text-sm capitalize">{key}</span>
                      <button
                        onClick={() =>
                          HandlePassengerUpdate(
                            key as keyof Omit<PassengerCount, "total">,
                            selectedClass,
                            -1,
                          )
                        }
                        className="px-3 py-1 border rounded hover:bg-gray-50"
                      >
                        -
                      </button>
                      <span className="px-4">
                        {passengerCount[key as keyof PassengerCount]}
                      </span>
                      <button
                        onClick={() =>
                          HandlePassengerUpdate(
                            key as keyof Omit<PassengerCount, "total">,
                            selectedClass,
                            1,
                          )
                        }
                        className="px-3 py-1 border rounded hover:bg-gray-50 ml-2"
                      >
                        +
                      </button>
                    </div>
                  ),
              )}
            </div>
            <div>
              <p>Class:</p>
              {Object.keys(classPassengerTotals).map((option) =>
                option !== "Total" ? (
                  <button
                    key={option}
                    onClick={() => {
                      setSelectedClass(option as keyof ClassTypes);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      selectedClass === option ? "bg-gray-50 font-medium" : ""
                    }`}
                  >
                    {option}
                  </button>
                ) : null,
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

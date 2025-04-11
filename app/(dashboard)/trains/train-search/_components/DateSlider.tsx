import { useState } from "react";

interface DateSliderProps {
  onDateChange: (date: string) => void;
}
export default function DateSlider ({ onDateChange }: DateSliderProps) {

  const dates = ["Tue 15", "Wed 16", "Thu 17", "Fri 18", 
    "Sat 19", "Sun 20", "Mon 21", "Tue 22", "Wed 23", "Thu 24", "Fri 25", "Sat 26", "Sun 27", "Mon 28", "Tue 29", "Wed 30"];
  const [selectedDate, setSelectedDate] = useState<string>("Wed 16");
  const [startIndex, setStartIndex] = useState<number>(0);
  const visibleCount = 8; // Number of dates visible at a time

 const handleDateChange = (date: string) => {
    setSelectedDate(date);
    onDateChange(date);

  };

  const handlePrev = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
  };

  const handleNext = () => {
    if (startIndex < dates.length - visibleCount) {
      setStartIndex(startIndex + 1);
    }
  };

  return (
    <div className="flex my-6 justify-between w-full items-center ">
      <button
        onClick={handlePrev}
        className="p-1   rounded-full hover:bg-gray-300 disabled:opacity-50"
        disabled={startIndex === 0}
      >
        <span className="text-[50px] font-medium"> &#8249; {/* Left caret */}</span>
       
      </button>

      <div className="w-full overflow-auto  flex space-x-2">
        {dates.slice(startIndex, startIndex + visibleCount).map((date) => (
          <button
            key={date}
            className={`text-sm rounded-md px-2 py-1 ${
              selectedDate === date
                ? "bg-[#16A34A] text-white"
                : "text-[#374151] bg-white"
            }`}
            onClick={() => handleDateChange(date)}
          >
            {date}
          </button>
        ))}
      </div>

      <button
        onClick={handleNext}
         className="p-1   rounded-full hover:bg-gray-300 disabled:opacity-50"
        disabled={startIndex >= dates.length - visibleCount}
      >
        
        <span className="text-[50px] font-medium"> &#8250; {/* Right caret */}</span>
      </button>
      
    </div>
  );
};

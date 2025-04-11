import { TRIP_TYPES } from "@/app/(dashboard)/trains/train-search/_constants/train.constants";
import { SelectorProps } from "@/app/utils/type";
import {useState} from "react"
import { FaCaretDown } from "react-icons/fa";

export default function Tripselector({value, onChange} : SelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
  
    const tripOptions = Object.values(TRIP_TYPES);

    return (
        <div className="relative border border-[#79747E] p-3 rounded-md flex items-center gap-3 text-sm">
            {/* {main button } */}
            <span
                className="absolute -top-2 left-3 bg-slate-100 px-1 text-xs text-[#79747E]"
                >Trip
            </span>
            <button 
            onClick={() => setIsOpen(!isOpen)}
            className="relative flex items-center w-full gap-3 text-sm transition-colors rounded-md hover:boder-gray-400"
            >
                
                <span className="font-medium">{value}</span>
                <FaCaretDown className={`text-[#77747E] ml-auto transition-transform duration-200 
                    ${isOpen ? "rotate-180" : ""}`}/>
            </button>
            {/* {dropdown menu} */}
            {isOpen && (
                <div
                className="absolute left-0 z-10 mt-1 bg-white border-gray-200 rounded-md shadow-lg top-full "
                >
                    {tripOptions.map((option) => (
                        <button
                        key={option}
                        onClick={() => {
                            onChange(option)
                            setIsOpen(false)
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors 
                            ${value === option ? "bg-gray-50 font-medium" : ""}`}
                        >
                            {option}
                        </button>
                    ))}
                    </div>
            )}
        </div>
    )
}
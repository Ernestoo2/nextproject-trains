import React, { useState } from "react";
import { FaRoute } from "react-icons/fa";

export default function FromToSelector() {
    const [isOpen, setIsOpen] = React.useState(false);
    const [selectedFrom, setSelectorFrom] = useState("Lahore");
    const [selectedTo, setSelectorTo] = useState("Karachi");

    const cityOptions = ["Lahore", "Karachi", "Islamabad", "Peshawar",
        "Isman", "Ihie", "Festac", "Patapa"
    ];
    function shuffleArray(cityOptions : Array<string>) { 
        for (let i = cityOptions.length - 1; i > 0; i--) {
             const j = Math.floor(Math.random() * (i + 1)); 
             [cityOptions[i], cityOptions[j]] = [cityOptions[j], cityOptions[i]]; } 
             return cityOptions;
            } 
    const shuffledCity = shuffleArray([...cityOptions]);
    return (
        <div className="relative border border-[#79747E] p-3 rounded-md flex items-center gap-3 text-sm">
            <span className="absolute -top-2 left-3 bg-slate-100 px-1 text-xs text-[#79747E]">
                    From - To
            </span>
            <button
             onClick={() => setIsOpen(!isOpen)}
            className="w-full relative  rounded-md flex items-center gap-3 text-sm "
            >
                
                <span className="font-medium">{selectedFrom} - {selectedTo}</span>
                <FaRoute className="text-[#79747E] ml-auto"/>
            </button>
            {isOpen && (
                <div 
                    className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10"
                >
                    <div className="w-full p-2 md:p-4  grid grid-cols-2 gap-4">
                        <div className=" " >
                            <p className="text-xs text-[#79747E] mb-2"> From:</p>
                            {cityOptions.map((city) => (
                                <button
                                    key={`from-${city}`}
                                    onClick={() => {
                                        setSelectorFrom(city);
                                        if (city === selectedTo) setSelectorTo("");
                                    }}
                                    className={`w-full text-left px-1 lg:px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedFrom === city ? "bg-gray-50 font-medium" : ""}`}
                                    disabled={city === selectedTo}
                                >
                                    {city}
                                </button>
                            ))}
                        </div>
                        <div className=" ">
                            <p className=" text-xs  text-[#79747E]  mb-2">To:</p>
                            {shuffledCity.map((city) => (
                                <button
                                    key={`to-${city}`}
                                    onClick={() => {
                                        setSelectorTo(city);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-1 lg:px-4 whitespace-pre-line py-2 text-sm hover:bg-gray-50 transition-colors
                                         ${selectedTo === city ? "bg-gray-50 font-medium" : ""}`}
                                     disabled={selectedFrom === city}
                                >
                                    { city}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                </div>
            )

            }
        </div>
    )
}

import React, { useState, useCallback, useMemo } from "react";
import { FaRoute } from "react-icons/fa";

interface City {
    id: string;
    name: string;
}

export default function FromToSelector() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedFrom, setSelectedFrom] = useState<City>({ id: "lahore", name: "Lahore" });
    const [selectedTo, setSelectedTo] = useState<City>({ id: "karachi", name: "Karachi" });

    // Define cities with unique IDs to prevent key-related issues
    const cities: City[] = useMemo(() => [
        { id: "lahore", name: "Lahore" },
        { id: "karachi", name: "Karachi" },
        { id: "islamabad", name: "Islamabad" },
        { id: "peshawar", name: "Peshawar" },
        { id: "isman", name: "Isman" },
        { id: "ihie", name: "Ihie" },
        { id: "festac", name: "Festac" },
        { id: "patapa", name: "Patapa" }
    ], []);

    // Memoized shuffle function to prevent unnecessary re-renders
    const shuffledCities = useMemo(() => {
        const shuffled = [...cities];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }, [cities]);

    const handleFromSelection = useCallback((city: City) => {
        if (city.id === selectedTo.id) return; // Prevent selecting same city
        setSelectedFrom(city);
    }, [selectedTo]);

    const handleToSelection = useCallback((city: City) => {
        if (city.id === selectedFrom.id) return; // Prevent selecting same city
        setSelectedTo(city);
        setIsOpen(false);
    }, [selectedFrom]);

    return (
        <div className="relative border border-[#79747E] p-3 rounded-md flex items-center gap-3 text-sm">
            <span className="absolute -top-2 left-3 bg-slate-100 px-1 text-xs text-[#79747E]">
                From - To
            </span>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full relative rounded-md flex items-center gap-3 text-sm"
                aria-expanded={isOpen}
                aria-label="Select route"
            >
                <span className="font-medium">
                    {selectedFrom.name} - {selectedTo.name}
                </span>
                <FaRoute className="text-[#79747E] ml-auto" />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    <div className="w-full p-2 md:p-4 grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-[#79747E] mb-2">From:</p>
                            <div className="space-y-1">
                                {cities.map((city) => (
                                    <button
                                        key={`from-${city.id}`}
                                        onClick={() => handleFromSelection(city)}
                                        className={`w-full text-left px-1 lg:px-4 py-2 text-sm hover:bg-gray-50 transition-colors
                                            ${selectedFrom.id === city.id ? "bg-gray-50 font-medium" : ""}
                                            ${selectedTo.id === city.id ? "opacity-50 cursor-not-allowed" : ""}`}
                                        disabled={city.id === selectedTo.id}
                                    >
                                        {city.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="text-xs text-[#79747E] mb-2">To:</p>
                            <div className="space-y-1">
                                {shuffledCities.map((city) => (
                                    <button
                                        key={`to-${city.id}`}
                                        onClick={() => handleToSelection(city)}
                                        className={`w-full text-left px-1 lg:px-4 py-2 text-sm hover:bg-gray-50 transition-colors
                                            ${selectedTo.id === city.id ? "bg-gray-50 font-medium" : ""}
                                            ${selectedFrom.id === city.id ? "opacity-50 cursor-not-allowed" : ""}`}
                                        disabled={selectedFrom.id === city.id}
                                    >
                                        {city.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
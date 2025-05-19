"use client";

import { Fragment, useState } from "react";
import { Combobox, Transition } from "@headlessui/react";
import { Check, ChevronsUpDown } from "lucide-react"; 
import type { Station } from "@/types/shared/trains";

interface StationComboboxProps {
  stations: Station[];
  selected: Station | null;
  onChange: (station: Station | null) => void;
  label: string;
  placeholder: string;
}

export default function StationCombobox({
  stations,
  selected,
  onChange,
  label,
  placeholder,
}: StationComboboxProps) {
  const [query, setQuery] = useState("");

  const filteredStations =
    query === ""
      ? stations
      : stations.filter((station) =>
          station.stationName
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, "")),
        );

  return (
    <div className="w-full">
      <Combobox value={selected} onChange={onChange}>
        <div className="relative">
          <div className="space-y-1">
            <Combobox.Label className="block text-[#4A5568] font-medium">
              {label}
            </Combobox.Label>
            <div className="relative w-full cursor-default overflow-hidden border-b-2 border-gray-200 focus-within:border-green-600">
              <Combobox.Input
                className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:outline-none"
                displayValue={(station: Station | null) => station?.stationName || ""}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setQuery(event.target.value)
                }
                placeholder={placeholder}
              />
              <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronsUpDown
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </Combobox.Button>
            </div>
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery("")}
          >
            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {filteredStations.length === 0 && query !== "" ? (
                <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                  Nothing found.
                </div>
              ) : (
                filteredStations.map((station) => (
                  <Combobox.Option
                    key={station._id}
                    className={({ active }: { active: boolean }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? "bg-green-600 text-white" : "text-gray-900"
                      }`
                    }
                    value={station}
                  >
                    {({
                      selected,
                      active,
                    }: {
                      selected: boolean;
                      active: boolean;
                    }) => (
                      <>
                        <span
                          className={`block truncate ${selected ? "font-medium" : "font-normal"}`}
                        >
                          {station.stationName}
                          <span className="ml-2 text-sm text-gray-500">
                            ({station.city}, {station.state})
                          </span>
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? "text-white" : "text-green-600"
                            }`}
                          >
                            <Check className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
    </div>
  );
}

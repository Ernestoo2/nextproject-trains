'use client';
import { Station } from '@/utils/mongodb/models';
import { useState, useEffect, useRef } from 'react';

interface Station {
  _id: string;
  name: string;
  code: string;
}

interface StationSelectProps {
  value: string;
  onChange: (station: Station) => void;
  placeholder: string;
  label: string;
}

export default function StationSelect({
  value,
  onChange,
  placeholder,
  label
}: StationSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/stations/search?q=' + encodeURIComponent(searchTerm));
        const data = await response.json();
        if (data.success) {
          setStations(data.data);
        }
      } catch (error) {
        console.error('Error fetching stations:', error);
      } finally {
        setLoading(false);
      }
    };

    if (searchTerm.length >= 2) {
      fetchStations();
    } else {
      setStations([]);
    }
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div
        className="border border-gray-300 rounded-md p-2 cursor-pointer bg-white"
        onClick={() => setIsOpen(true)}
      >
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full outline-none"
        />
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="p-2 text-center text-gray-500">Loading...</div>
          ) : stations.length === 0 ? (
            <div className="p-2 text-center text-gray-500">
              {searchTerm.length < 2 ? 'Type at least 2 characters' : 'No stations found'}
            </div>
          ) : (
            stations.map((station) => (
              <div
                key={station._id}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  onChange(station);
                  setSearchTerm(station.name);
                  setIsOpen(false);
                }}
              >
                <div className="font-medium">{station.name}</div>
                <div className="text-sm text-gray-500">{station.code}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
} 
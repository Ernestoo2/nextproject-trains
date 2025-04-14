"use client";
import React, { useState, useEffect } from "react";
import { apiService } from "../_services/api.service";
import { TrainClass, TripType, Station } from "../_types/api.types";
import TrainSearchResults from "./_components/TrainSearchResult";

export default function TrainSearchPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [trainClasses, setTrainClasses] = useState<TrainClass[]>([]);
  const [tripTypes, setTripTypes] = useState<TripType[]>([]);
  const [stations, setStations] = useState<Station[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [classesResponse, typesResponse, stationsResponse] =
          await Promise.all([
            apiService.getTrainClasses(),
            apiService.getTripTypes(),
            apiService.getStations(),
          ]);

        if (classesResponse.success) setTrainClasses(classesResponse.data);
        if (typesResponse.success) setTripTypes(typesResponse.data);
        if (stationsResponse.success) setStations(stationsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <TrainSearchResults />
    </div>
  );
}

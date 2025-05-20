import mongoose, { Schema } from "mongoose";
import { stationsData } from "./stations.data";
import type { Station } from "@/types/shared/trains";
import type { RouteDocument } from "@/utils/mongodb/models/Route";

interface RouteGeneratorParams {
  fromStation: Station;
  toStation: Station;
  availableClassIds: Schema.Types.ObjectId[];
}



function calculateDistance(fromStation: Station, toStation: Station): number {
  // TODO: Implement actual distance calculation based on coordinates
  // For now, generate a realistic distance between 100-1500 km
  const minDistance = 100;
  const maxDistance = 1500;
  return Math.floor(Math.random() * (maxDistance - minDistance)) + minDistance;
}

function generateRoute({
  fromStation,
  toStation,
  availableClassIds,
}: RouteGeneratorParams): Pick<RouteDocument, 
  | "routeCode" 
  | "routeName" 
  | "fromStation" 
  | "toStation" 
  | "distance" 
  | "baseFare" 
  | "estimatedDuration" 
  | "availableClasses" 
  | "isActive"
> {
  // Calculate realistic distance
  const distance = calculateDistance(fromStation, toStation);

  // Base fare calculation (₦2 per km)
  const baseFare = Math.floor(distance * 2);

  // Calculate estimated duration (assume average speed of 100 km/h)
  const hours = Math.floor(distance / 100);
  const minutes = Math.floor(((distance % 100) / 100) * 60);
  const estimatedDuration = `${hours}h ${minutes}m`;

  // Generate unique route code using station codes
  const routeCode = `RT-${fromStation.stationCode}-${toStation.stationCode}`;
  
  // Generate descriptive route name
  const routeName = `${fromStation.stationName} to ${toStation.stationName}`;

  // Convert string IDs to ObjectIds
  const fromStationId = new mongoose.Types.ObjectId(fromStation._id) as unknown as Schema.Types.ObjectId;
  const toStationId = new mongoose.Types.ObjectId(toStation._id) as unknown as Schema.Types.ObjectId;

  return {
    routeCode,
    routeName,
    fromStation: fromStationId,
    toStation: toStationId,
    distance,
    baseFare,
    estimatedDuration,
    availableClasses: availableClassIds,
    isActive: true
  };
}

/**
 * Recursively generates routes between stations
 */
function generateAllRoutesRecursively(
  remainingStations: Station[],
  processedStations: Station[] = [],
  routes: ReturnType<typeof generateRoute>[] = [],
  availableClassIds: Schema.Types.ObjectId[]
): ReturnType<typeof generateRoute>[] {
  // Base case: no more stations to process
  if (remainingStations.length === 0) {
    return routes;
  }

  // Take current station
  const currentStation = remainingStations[0];
  
  // Generate routes between current station and all processed stations
  processedStations.forEach(processedStation => {
    // Forward route
    routes.push(generateRoute({
      fromStation: currentStation,
      toStation: processedStation,
      availableClassIds
    }));
    
    // Reverse route
    routes.push(generateRoute({
      fromStation: processedStation,
      toStation: currentStation,
      availableClassIds
    }));
  });

  // Recursive call with remaining stations
  return generateAllRoutesRecursively(
    remainingStations.slice(1),
    [...processedStations, currentStation],
    routes,
    availableClassIds
  );
}

/**
 * Generates routes between all possible station pairs.
 * For n stations, generates n * (n-1) routes total.
 */
export function generateAllRoutes(
  availableClassIds: Schema.Types.ObjectId[]
): ReturnType<typeof generateRoute>[] {
  return generateAllRoutesRecursively(stationsData, [], [], availableClassIds);
}

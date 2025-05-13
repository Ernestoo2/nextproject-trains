import { Types } from "mongoose";
import type { RouteDocument } from "@/utils/mongodb/models/Route";
import type { StationDocument } from "@/utils/mongodb/models/Station";
import type { TrainClass, ITrain } from "@/types/shared/trains";
import type { ISchedule } from "@/types/schedule/scheduleBase.types";

const SCHEDULES_PER_ROUTE = 63; // 3 slots * 21 days

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates complete station connectivity
 */
function validateStationConnectivity(routes: RouteDocument[], stations: StationDocument[]): ValidationResult {
  const errors: string[] = [];
  const stationConnections = new Map<string, Set<string>>();

  stations.forEach(station => {
    stationConnections.set(station._id.toString(), new Set<string>());
  });

  routes.forEach(route => {
    if (!route.fromStation || !route.toStation) {
      errors.push(`Connectivity Error: Route ${route._id ? route._id.toString() : 'UnknownRoute'} has missing fromStation/toStation references.`);
      return; 
    }
    const fromStationIdStr = route.fromStation.toString(); 
    const toStationIdStr = route.toStation.toString();   

    const fromConnections = stationConnections.get(fromStationIdStr);
    const toConnections = stationConnections.get(toStationIdStr);
    
    if (fromConnections && toConnections) {
      fromConnections.add(toStationIdStr);
      toConnections.add(fromStationIdStr);
    } else {
      if (!fromConnections) errors.push(`Connectivity Error: fromStation ID '${fromStationIdStr}' (route ${route._id.toString()}) not found in stationConnections map.`);
      if (!toConnections) errors.push(`Connectivity Error: toStation ID '${toStationIdStr}' (route ${route._id.toString()}) not found in stationConnections map.`);
    }
  });

  stations.forEach(station1 => {
    stations.forEach(station2 => {
      if (station1._id.equals(station2._id)) return;
      
      const connections = stationConnections.get(station1._id.toString());
      if (!connections?.has(station2._id.toString())) {
        const station1Name = station1.stationName || station1._id.toString();
        const station2Name = station2.stationName || station2._id.toString();
        errors.push(`No route connection between ${station1Name} (${station1._id.toString()}) and ${station2Name} (${station2._id.toString()})`);
      }
    });
  });
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates route class assignments
 */
function validateRouteClasses(routes: RouteDocument[], trainClasses: TrainClass[]): ValidationResult {
  const errors: string[] = [];
  const validClassIds = new Set(trainClasses.map(tc => tc._id.toString()));

  routes.forEach(route => {
    if (!route.availableClasses || route.availableClasses.length === 0) {
      errors.push(`Route ${route._id.toString()} has no class assignments`);
      return;
    }

    route.availableClasses.forEach(classId => {
      if (!validClassIds.has(classId.toString())) { 
        errors.push(`Route ${route._id.toString()} has invalid class assignment: ${classId.toString()}`);
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates schedule coverage and integrity
 */
function validateScheduleCoverage(
  schedules: Omit<ISchedule, "_id">[],
  routes: RouteDocument[],
  trains: ITrain[]
): ValidationResult {
  const errors: string[] = [];
  const routeSchedules = new Map<string, Set<string>>();
  const trainAssignments = new Map<string, Set<string>>();
  const departureDatesByRoute = new Map<string, Set<string>>();

  routes.forEach(route => {
    const routeIdStr = route._id.toString();
    routeSchedules.set(routeIdStr, new Set<string>());
    departureDatesByRoute.set(routeIdStr, new Set<string>());
  });

  trains.forEach(train => {
    trainAssignments.set(train._id.toString(), new Set<string>());
  });

  schedules.forEach(schedule => {
    const routeIdStr = schedule.route.toString();
    const trainIdStr = schedule.train.toString();
    const scheduleKey = `${schedule.date}-${schedule.departureTime}`;

    const routeSet = routeSchedules.get(routeIdStr);
    if (routeSet) routeSet.add(scheduleKey);
    else errors.push(`Schedule Coverage Error: Route ID ${routeIdStr} from schedule not found in initial route map.`);
    
    const trainSet = trainAssignments.get(trainIdStr);
    if (trainSet) trainSet.add(scheduleKey);
    else errors.push(`Schedule Coverage Error: Train ID ${trainIdStr} from schedule not found in initial train map.`);
    
    const departureDateSet = departureDatesByRoute.get(routeIdStr);
    if (departureDateSet) {
      if (schedule.date instanceof Date && !isNaN(schedule.date.getTime())) {
        const dateString = schedule.date.toISOString().split('T')[0];
        departureDateSet.add(dateString);
      } else {
        errors.push(`Invalid date object found for schedule on route ${routeIdStr}: ${schedule.date}`);
      }
    } else {
      errors.push(`Schedule Coverage Error: Route ID ${routeIdStr} for date tracking not found in initial route map.`);
    }
  });

  routes.forEach(route => {
    const routeIdStr = route._id.toString();
    const routeSet = routeSchedules.get(routeIdStr);
    if (!routeSet || routeSet.size !== SCHEDULES_PER_ROUTE) {
      errors.push(`Route ${routeIdStr} has ${routeSet?.size || 0} schedules, expected ${SCHEDULES_PER_ROUTE}`);
    }
    const departureDateSet = departureDatesByRoute.get(routeIdStr);
    if (!departureDateSet || departureDateSet.size !== 21) {
      errors.push(`Route ${routeIdStr} covers ${departureDateSet?.size || 0} unique departure days (YYYY-MM-DD), expected 21`);
    }
  });

  trains.forEach(train => {
    const trainIdStr = train._id.toString();
    const trainSet = trainAssignments.get(trainIdStr);
    if (!trainSet || trainSet.size === 0) {
      errors.push(`Train ${trainIdStr} has no schedules assigned`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates all aspects of the generated data
 */
export function validateAll(
  routes: RouteDocument[],
  schedules: Omit<ISchedule, "_id">[],
  trainClasses: TrainClass[],
  trains: ITrain[],
  stations: StationDocument[]
): ValidationResult {
  const errors: string[] = [];

  const connectivityValidation = validateStationConnectivity(routes, stations);
  if (!connectivityValidation.isValid) errors.push(...connectivityValidation.errors);

  const classValidation = validateRouteClasses(routes, trainClasses);
  if (!classValidation.isValid) errors.push(...classValidation.errors);

  const coverageValidation = validateScheduleCoverage(schedules, routes, trains);
  if (!coverageValidation.isValid) errors.push(...coverageValidation.errors);
  
  return {
    isValid: errors.length === 0,
    errors
  };
} 
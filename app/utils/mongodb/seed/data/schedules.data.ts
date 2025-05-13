import { Types } from "mongoose";
import type { ISchedule } from "@/types/schedule/scheduleBase.types";
import type {
  Route,
  TrainClass
} from "@/types/shared/trains";

const OPERATING_HOURS = {
  START: 5,  // 5:00
  END: 22,   // 22:00
} as const;

const MAX_SCHEDULE_DAYS = 21;

const CLASS_MULTIPLIERS = {
  "FIRST_CLASS": 2.5,
  "BUSINESS": 2.0,
  "PREMIUM_ECONOMY": 1.5,
  "ECONOMY": 1.0,
  "STANDARD": 1.0,
  "SLEEPER": 1.8
} as const;

interface ScheduleGeneratorParams {
  trainId: Types.ObjectId;
  route: Route;
  availableSeats: Record<string, number>;
  classIds: Types.ObjectId[];
  trainClasses: TrainClass[];
}

function generateTimeSlots(): string[] {
  // Generate 3 fixed time slots with some randomization
  const baseSlots = [
    OPERATING_HOURS.START + 2,    // Morning (7:00)
    OPERATING_HOURS.START + 7,    // Afternoon (12:00)
    OPERATING_HOURS.END - 5       // Evening (17:00)
  ];
  
  return baseSlots.map(hour => {
    // Add random minutes (0-45 in 15-minute intervals)
    const minutes = Math.floor(Math.random() * 4) * 15;
    return `${hour.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  }).sort();
}

function addMinutesWithDayChange(time: string, minsToAdd: number): { time: string; nextDay: boolean } {
  const [hours, minutes] = time.split(":").map(Number);
  let totalMinutes = hours * 60 + minutes + minsToAdd;
  
  const nextDay = totalMinutes >= 24 * 60;
  if (nextDay) {
    totalMinutes = totalMinutes % (24 * 60);
  }
  
  const newHours = Math.floor(totalMinutes / 60);
  const newMinutes = totalMinutes % 60;
  
  return {
    time: `${newHours.toString().padStart(2, "0")}:${newMinutes.toString().padStart(2, "0")}`,
    nextDay
  };
}

function calculateFare(distance: number, classType: string): number {
  const baseFare = Math.floor(distance * 2); // 2 units per km
  const multiplier = CLASS_MULTIPLIERS[classType as keyof typeof CLASS_MULTIPLIERS] || CLASS_MULTIPLIERS.STANDARD;
  return Math.floor(baseFare * multiplier);
}

function generateScheduleForDate(
  params: ScheduleGeneratorParams,
  date: string,
  departureTime: string
): Omit<ISchedule, "_id"> {
  // Parse duration from route
  const [hours, minutes] = params.route.estimatedDuration.match(/(\d+)h\s*(\d+)m/)?.slice(1).map(Number) || [2, 30];
  const totalMinutes = (hours * 60) + minutes;
  
  // Calculate arrival time
  const { time: arrivalTime, nextDay } = addMinutesWithDayChange(departureTime, totalMinutes);

  // Calculate fares for each class
  const fares = new Map<string, number>();
  params.classIds.forEach(id => {
    const trainClass = params.trainClasses.find(tc => tc._id.toString() === id.toString());
    const classType = trainClass?.classType || "STANDARD";
    fares.set(id.toString(), calculateFare(params.route.distance, classType));
  });

  // Create available seats map
  const availableSeats = new Map<string, number>();
  Object.entries(params.availableSeats).forEach(([id, seats]) => {
    availableSeats.set(id, seats);
  });

  // Convert departure date string to Date object for the schema
  const departureDateObject = new Date(date); 

  // Create schedule
  const schedule: Omit<ISchedule, "_id"> = {
    train: params.trainId,
    route: new Types.ObjectId(params.route._id),
    departureTime,
    arrivalTime,
    date: departureDateObject,
    availableSeats,
    fare: fares,
    status: "SCHEDULED",
    isActive: true,
    duration: params.route.estimatedDuration,
    platform: `${Math.floor(Math.random() * 10) + 1}`,
  };

  return schedule;
}

/**
 * Recursively generates schedules for a route
 */
function generateSchedulesRecursively(
  route: Route,
  remainingDays: number,
  params: Omit<ScheduleGeneratorParams, 'route'>,
  currentDate: Date, 
  schedules: Omit<ISchedule, "_id">[] = [] 
): Omit<ISchedule, "_id">[] {
  // Base case: no more days to process
  if (remainingDays === 0) {
    return schedules;
  }

  // Generate time slots for current day
  const departureSlots = generateTimeSlots();
  const dateString = currentDate.toISOString().split('T')[0];

  // Generate schedules for each time slot
  departureSlots.forEach(departureTime => {
    schedules.push(
      generateScheduleForDate(
        { ...params, route },
        dateString,
        departureTime
      )
    );
  });

  // Next day
  const nextDate = new Date(currentDate);
  nextDate.setDate(nextDate.getDate() + 1);

  // Recursive call for next day
  return generateSchedulesRecursively(
    route,
    remainingDays - 1,
    params,
    nextDate, // Pass the updated nextDate
    schedules
  );
}

export function generateSchedulesForRoutes(
  routes: Route[],
  classIds: Types.ObjectId[],
  availableSeats: Record<string, number>,
  trainId: Types.ObjectId,
  trainClasses: TrainClass[]
): Omit<ISchedule, "_id">[] {
  const params = {
    trainId,
    classIds,
    availableSeats,
    trainClasses
  };

  // Initialize startDate ONCE for all routes for this train
  const startDate = new Date(); 
  startDate.setHours(0, 0, 0, 0); // Normalize to start of day

  return routes.reduce((allSchedules, route) => {
    const routeSchedules = generateSchedulesRecursively(
              route,
      MAX_SCHEDULE_DAYS,
      params,
      startDate // Pass the same startDate for each route of this train
    );
    return [...allSchedules, ...routeSchedules];
  }, [] as Omit<ISchedule, "_id">[]);
}

export function generateInitialAvailableSeats(
  classCapacities: Record<string, number>
): Record<string, number> {
  return Object.fromEntries(
    Object.entries(classCapacities).map(([classId, capacity]) => [
      classId,
      capacity,
    ])
  );
}

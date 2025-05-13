import mongoose from "mongoose";
import { connectDB } from "../connect";
import { Route } from "../models/Route";
import { Schedule } from "../models/Schedule";
import { Station } from "../models/Station";
import { Train } from "../models/Train";
import { TrainClass } from "../models/TrainClass";
import { generateAllRoutes } from "./data/routes.data";
import { generateSchedulesForRoutes } from "./data/schedules.data";
import { stationsData } from "./data/stations.data";
import { trainClassesData } from "./data/trainClasses.data";
import { trainsData } from "./data/trains.data";
import { validateAll } from "./validation";
import type { ISchedule } from "@/types/schedule/scheduleBase.types";
import type { ITrain } from "@/types/shared/trains";

interface WriteError {
  index: number;
  code: number;
  keyPattern: Record<string, number>;
  keyValue: Record<string, unknown>;
}

interface MongoServerError extends Error {
  code?: number;
  writeErrors?: WriteError[];
}

/**
 * Recursively assigns routes to trains
 */
function assignRoutesToTrainsRecursively(
  remainingRoutes: typeof Route.prototype[],
  remainingTrains: ITrain[],
  assignments: Map<string, typeof Route.prototype[]> = new Map()
): Map<string, typeof Route.prototype[]> {
  // Base case: no more routes or trains
  if (remainingRoutes.length === 0 || remainingTrains.length === 0) {
    return assignments;
  }

  // Get current train
  const currentTrain = remainingTrains[0];
  
  // Calculate routes for this train
  const routesPerTrain = Math.ceil(remainingRoutes.length / remainingTrains.length);
  const trainRoutes = remainingRoutes.slice(0, routesPerTrain);
  
  // Assign routes to train
  assignments.set(currentTrain._id, trainRoutes);

  // Recursive call with remaining routes and trains
  return assignRoutesToTrainsRecursively(
    remainingRoutes.slice(routesPerTrain),
    remainingTrains.slice(1),
    assignments
  );
}

export async function seedDatabase() {
  try {
    await connectDB();

    // Clear existing data
    await Promise.all([
      Station.deleteMany({}),
      Route.deleteMany({}),
      TrainClass.deleteMany({}),
      Train.deleteMany({}),
      Schedule.deleteMany({}),
    ]);

    // 1. Seed Stations
    const stations = await Station.insertMany(stationsData);
    console.log(`✓ Stations seeded successfully (${stations.length} stations)`);

    // 2. Seed Train Classes
    const trainClasses = await TrainClass.insertMany(trainClassesData);
    console.log(`✓ Train classes seeded successfully (${trainClasses.length} classes)`);

    // 3. Create Routes with proper ObjectIds
    const classIds = trainClasses.map(tc => tc._id);
    
    // Generate routes between all stations
    const allRoutes = generateAllRoutes(classIds);
    const createdRoutes = await Route.insertMany(allRoutes);
    console.log(`✓ Routes seeded successfully (${createdRoutes.length} routes)`);

    // 4. Seed Trains
    const trains = await Train.insertMany(trainsData);
    console.log(`✓ Trains seeded successfully (${trains.length} trains)`);

    // 5. Generate and seed schedules
    const availableSeats = Object.fromEntries(
      trainClasses.map(tc => [tc._id.toString(), tc.capacity])
    );

    const schedules: Omit<ISchedule, "_id">[] = [];
    
    // Assign routes to trains recursively
    const trainRouteAssignments = assignRoutesToTrainsRecursively(createdRoutes, trains);
    
    // Generate schedules for each train's routes
    trainRouteAssignments.forEach((routes, trainId) => {
      const trainSchedules = generateSchedulesForRoutes(
        routes,
        classIds,
        availableSeats,
        new mongoose.Types.ObjectId(trainId),
        trainClasses
      );
      schedules.push(...trainSchedules);
    });

    // Validate all schedules before insertion (using the separate validation file)
    const validationResult = validateAll(createdRoutes, schedules, trainClasses, trains, stations);
    if (!validationResult.isValid) {
      console.error("Validation.ts check failed:");
      validationResult.errors.forEach((error: string) => console.error(`- ${error}`));
      throw new Error("Validation.ts check failed");
    }

    // --- RESTORE ORIGINAL insertMany BLOCK ---
    try {
      await Schedule.insertMany(schedules, { ordered: false });
      console.log(`✓ Schedules seeded successfully (${schedules.length} schedules)`);
    } catch (error: unknown) {
      // Type guard for MongoServerError
      if (error instanceof Error) {
        const mongoError = error as MongoServerError;
        if (mongoError.code === 11000 && mongoError.writeErrors) {
          console.error("Duplicate schedule entries found (insertMany):");
          mongoError.writeErrors.forEach(err => {
            // Log the actual key value if possible
            console.error(`- Duplicate key: ${JSON.stringify(err.keyValue)}`); 
          });
          throw new Error("Duplicate schedule entries found during insertMany");
        } else if (mongoError.code === 11000) {
           // Handle case where it's a duplicate error but writeErrors is not available
           console.error("Duplicate schedule entry found (insertMany, no writeErrors detail):", mongoError);
           throw new Error("Duplicate schedule entry found during insertMany (no details)");
        }
      }
      // Re-throw other errors
      console.error("Non-duplicate error during insertMany:", error);
      throw error;
    }
    // --- END RESTORE --- 

    // Log coverage statistics
    const stats = {
      stations: stations.length,
      trainClasses: trainClasses.length,
      routes: createdRoutes.length,
      trains: trains.length,
      schedules: schedules.length,
      expectedRoutes: stations.length * (stations.length - 1), // n * (n-1) for all possible routes
      expectedSchedules: createdRoutes.length * 21 * 3 // routes * days * slots_per_day
    };

    console.log("\nSeeding Statistics:");
    console.log("------------------");
    console.log(`Stations: ${stats.stations}`);
    console.log(`Train Classes: ${stats.trainClasses}`);
    console.log(`Routes: ${stats.routes}/${stats.expectedRoutes} (${Math.round(stats.routes/stats.expectedRoutes*100)}% coverage)`);
    console.log(`Trains: ${stats.trains}`);
    console.log(`Schedules: ${stats.schedules}/${stats.expectedSchedules} (${Math.round(stats.schedules/stats.expectedSchedules*100)}% coverage)`);
    console.log(`Routes per train: ~${Math.ceil(createdRoutes.length / trains.length)}`);

    return {
      success: true,
      message: "Database seeded successfully",
      counts: stats
    };
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
} 
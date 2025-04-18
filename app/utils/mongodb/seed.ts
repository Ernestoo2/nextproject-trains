import mongoose from "mongoose";
import { connectDB } from "./connect";
import { Route } from "./models/Route";
import { Schedule } from "./models/Schedule";
import { Station } from "./models/Station";
import { Train } from "./models/Train";
import { TrainClass } from "./models/TrainClass";

interface ScheduleSeedData {
  train: mongoose.Types.ObjectId;
  route: mongoose.Types.ObjectId;
  departureTime: string;
  arrivalTime: string;
  date: Date;
  availableSeats: Record<string, number>;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  isActive: boolean;
}

interface RouteSeedData {
  fromStation: mongoose.Types.ObjectId;
  toStation: mongoose.Types.ObjectId;
  distance: number;
  baseFare: number;
  estimatedDuration: string;
  availableClasses: mongoose.Types.ObjectId[];
  isActive: boolean;
}

export async function seedData() {
  try {
    await connectDB();

    // Clear existing data
    try {
    await Promise.all([
      Station.deleteMany({}),
      TrainClass.deleteMany({}),
      Train.deleteMany({}),
      Route.deleteMany({}),
        Schedule.deleteMany({})
    ]);
    } catch (error) {
      throw new Error("DataSeedingError: failed to clear existing data.");
    }

    // Create stations
    try {
    const stations = await Station.create([
        { name: 'Abuja', code: 'ABJ', city: 'Abuja', state: 'Federal Capital Territory', isActive: true },
        { name: 'Kano', code: 'KAN', city: 'Kano', state: 'Kano', isActive: true },
        { name: 'Port Harcourt', code: 'PHC', city: 'Port Harcourt', state: 'Rivers', isActive: true },
        { name: 'Ibadan', code: 'IBD', city: 'Ibadan', state: 'Oyo', isActive: true },
        { name: 'Kaduna', code: 'KAD', city: 'Kaduna', state: 'Kaduna', isActive: true },
        { name: 'Enugu', code: 'ENU', city: 'Enugu', state: 'Enugu', isActive: true }
      ]);
    } catch (error) {
      throw new Error("DataSeedingError: failed to create stations.");
    }

    // Create train classes
    try {
    const trainClasses = await TrainClass.create([
        { name: 'First Class AC', code: '1A', baseFare: 2000, isActive: true },
        { name: 'Second Class AC', code: '2A', baseFare: 1500, isActive: true },
        { name: 'Third Class AC', code: '3A', baseFare: 1000, isActive: true },
        { name: 'Sleeper Class', code: 'SL', baseFare: 500, isActive: true },
        { name: 'Standard Class', code: 'SC', baseFare: 300, isActive: true }
      ]);
    } catch (error) {
      throw new Error("DataSeedingError: failed to create train classes.");
    }

    // Create trains
    try { 
    const trains = await Train.create([
      {
          trainName: 'Nigerian Express',
          trainNumber: 'NE001',
          routes: [],
          classes: [],
          isActive: true
        },
        {
          trainName: 'Capital Limited',
          trainNumber: 'CL002',
          routes: [],
          classes: [],
          isActive: true
        }
      ]);

      // Update trains with classes
      const trainClasses = await TrainClass.find({ isActive: true });
      for (const train of trains) {
        train.classes = trainClasses.map(tc => tc._id);
        await train.save();
      } 

      // Create routes
      try {
        const stations = await Station.find({ isActive: true });
        const trainClasses = await TrainClass.find({ isActive: true });
        const routes: RouteSeedData[] = [];

        // Create bi-directional routes between all stations
    for (let i = 0; i < stations.length; i++) {
      for (let j = i + 1; j < stations.length; j++) {
            const distance = Math.floor(Math.random() * 1000) + 500;
            const baseFare = Math.floor(distance * 2);
            const hours = Math.floor(distance / 100);
            const minutes = Math.floor((distance % 100) / 100 * 60);
            const estimatedDuration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

        // Create route from station i to j
        routes.push({
          fromStation: stations[i]._id,
          toStation: stations[j]._id,
          distance,
          baseFare,
          estimatedDuration,
              availableClasses: trainClasses.map(tc => tc._id),
              isActive: true
        });

            // Create route from station j to i
        routes.push({
          fromStation: stations[j]._id,
          toStation: stations[i]._id,
          distance,
          baseFare,
          estimatedDuration,
              availableClasses: trainClasses.map(tc => tc._id),
              isActive: true
        });
      }
    }

        const createdRoutes = await Route.create(routes); 

        // Update trains with routes
        for (const train of trains) {
          const trainRoutes = createdRoutes.map(route => ({
            route: route._id,
            arrivalTime: '08:00',
            departureTime: '08:30'
          }));

          train.routes = trainRoutes;
          await train.save();
        } 

        // Create schedules
        try { 
          const schedules: ScheduleSeedData[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

          for (let i = 0; i < 14; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            date.setHours(0, 0, 0, 0);

            for (const train of trains) {
              // Create schedules for all routes of the train
              for (const routeRef of train.routes) {
                if (!routeRef) {
                  continue;
                }

                // Get the full route document with populated station data
                const route = await Route.findById(routeRef.route).populate('fromStation').populate('toStation');
                if (!route) {
                  continue;
                }

                // Generate random departure time between 6:00 and 20:00
                const depHour = Math.floor(Math.random() * 14) + 6; // 6 to 20
                const depMinute = Math.floor(Math.random() * 12) * 5; // 0, 5, 10, ..., 55
                const departureTime = `${depHour.toString().padStart(2, '0')}:${depMinute.toString().padStart(2, '0')}`;

          // Calculate arrival time based on route duration
                const [hours, minutes] = route.estimatedDuration.split(':').map(Number);
                const depTime = new Date();
                depTime.setHours(depHour, depMinute, 0, 0);
                depTime.setMinutes(depTime.getMinutes() + minutes);
                depTime.setHours(depTime.getHours() + hours);
                const arrivalTime = `${depTime.getHours().toString().padStart(2, '0')}:${depTime.getMinutes().toString().padStart(2, '0')}`;

                // Create available seats for each class
                const availableSeatsObj: Record<string, number> = {};
          for (const classId of route.availableClasses) {
                  const trainClass = await TrainClass.findById(classId);
            if (trainClass) {
                    availableSeatsObj[trainClass.code] = Math.floor(Math.random() * 50) + 50; // 50-100 seats per class
            }
          }

          schedules.push({
                  train: train._id,
            route: route._id,
            departureTime,
            arrivalTime,
                  date,
                  availableSeats: availableSeatsObj,
                  status: 'SCHEDULED',
                  isActive: true
          });
        }
      }
    }

          const createdSchedules = await Schedule.create(schedules);
        } catch (error) {
          throw new Error("DataSeedingError: failed to create schedules.");
        }
      } catch (error) {
        throw new Error("DataSeedingError: error during route creation.");
      }
    } catch (error) {
      throw new Error("DataSeedingError: error during train creation process.");
    }
  } catch (error) {
    throw new Error("DataSeedingError: seed operation failed.");
  }
}

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
    console.log('Starting database seed operation...');
    await connectDB();
    console.log('Connected to database successfully');

    // Clear existing data
    try {
      console.log('Clearing existing data...');
    await Promise.all([
      Station.deleteMany({}),
      TrainClass.deleteMany({}),
      Train.deleteMany({}),
      Route.deleteMany({}),
        Schedule.deleteMany({})
    ]);
      console.log('Existing data cleared successfully');
    } catch (error) {
      console.error('Error clearing existing data:', error);
      throw error;
    }

    // Create stations
    try {
      console.log('Creating stations...');
    const stations = await Station.create([
        { name: 'Abuja', code: 'ABJ', city: 'Abuja', state: 'Federal Capital Territory', isActive: true },
        { name: 'Kano', code: 'KAN', city: 'Kano', state: 'Kano', isActive: true },
        { name: 'Port Harcourt', code: 'PHC', city: 'Port Harcourt', state: 'Rivers', isActive: true },
        { name: 'Ibadan', code: 'IBD', city: 'Ibadan', state: 'Oyo', isActive: true },
        { name: 'Kaduna', code: 'KAD', city: 'Kaduna', state: 'Kaduna', isActive: true },
        { name: 'Enugu', code: 'ENU', city: 'Enugu', state: 'Enugu', isActive: true }
      ]);
      console.log('Stations created successfully:', stations.length);
    } catch (error) {
      console.error('Error creating stations:', error);
      throw error;
    }

    // Create train classes
    try {
      console.log('Creating train classes...');
    const trainClasses = await TrainClass.create([
        { name: 'First Class AC', code: '1A', baseFare: 2000, isActive: true },
        { name: 'Second Class AC', code: '2A', baseFare: 1500, isActive: true },
        { name: 'Third Class AC', code: '3A', baseFare: 1000, isActive: true },
        { name: 'Sleeper Class', code: 'SL', baseFare: 500, isActive: true },
        { name: 'Standard Class', code: 'SC', baseFare: 300, isActive: true }
      ]);
      console.log('Train classes created successfully:', trainClasses.length);
    } catch (error) {
      console.error('Error creating train classes:', error);
      throw error;
    }

    // Create trains
    try {
      console.log('Creating trains...');
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
      console.log('Trains created successfully:', trains.length);

      // Update trains with classes
      const trainClasses = await TrainClass.find({ isActive: true });
      for (const train of trains) {
        train.classes = trainClasses.map(tc => tc._id);
        await train.save();
      }
      console.log('Trains updated with classes successfully');

      // Create routes
      try {
        console.log('Creating routes...');
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
        console.log('Routes created successfully:', createdRoutes.length);

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
        console.log('Trains updated with routes successfully');

        // Create schedules
        try {
          console.log('Creating schedules...');
          const schedules: ScheduleSeedData[] = [];
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          console.log('Today:', today.toISOString());

          for (let i = 0; i < 14; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            date.setHours(0, 0, 0, 0);
            console.log(`Creating schedules for date: ${date.toISOString()}`);

            for (const train of trains) {
              console.log(`Creating schedules for train: ${train.trainName} (${train.trainNumber})`);
              // Create schedules for all routes of the train
              for (const routeRef of train.routes) {
                if (!routeRef) {
                  console.log('Skipping undefined route reference');
                  continue;
                }

                // Get the full route document with populated station data
                const route = await Route.findById(routeRef.route).populate('fromStation').populate('toStation');
                if (!route) {
                  console.log('Route not found:', routeRef.route);
                  continue;
                }
                console.log(`Found route from ${(route.fromStation as any).name} to ${(route.toStation as any).name}`);
                console.log(`Route details: ${JSON.stringify({
                  fromStation: route.fromStation,
                  toStation: route.toStation,
                  distance: route.distance,
                  baseFare: route.baseFare,
                  estimatedDuration: route.estimatedDuration
                }, null, 2)}`);

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
                console.log(`Generated times - Departure: ${departureTime}, Arrival: ${arrivalTime}`);

                // Create available seats for each class
                const availableSeatsObj: Record<string, number> = {};
                for (const classId of route.availableClasses) {
                  const trainClass = await TrainClass.findById(classId);
                  if (trainClass) {
                    availableSeatsObj[trainClass.code] = Math.floor(Math.random() * 50) + 50; // 50-100 seats per class
                    console.log(`Set ${availableSeatsObj[trainClass.code]} seats for class ${trainClass.code}`);
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
                console.log('Added schedule to batch');
              }
            }
          }

          console.log('Total schedules to create:', schedules.length);
          const createdSchedules = await Schedule.create(schedules);
          console.log('Schedules created successfully:', createdSchedules.length);
        } catch (error) {
          console.error('Error creating schedules:', error);
          throw error;
        }
      } catch (error) {
        console.error('Error in seed operation:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in seed operation:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in seed operation:', error);
    throw error;
  }
}

import { connectDB } from "./connect";
import { Station } from "./models/Station";
import { TrainClass } from "./models/TrainClass";
import { Train } from "./models/Train";
import { Route } from "./models/Route";
import { Schedule } from "./models/Schedule";
import mongoose from "mongoose";

async function seedData() {
  try {
    await connectDB();

    // Clear existing data
    await Promise.all([
      Station.deleteMany({}),
      TrainClass.deleteMany({}),
      Train.deleteMany({}),
      Route.deleteMany({}),
      Schedule.deleteMany({}),
    ]);

    // Create stations
    const stations = await Station.create([
      { name: "Mumbai Central", code: "MMCT", city: "Mumbai", state: "Maharashtra" },
      { name: "New Delhi", code: "NDLS", city: "Delhi", state: "Delhi" },
      { name: "Chennai Central", code: "MAS", city: "Chennai", state: "Tamil Nadu" },
      { name: "Howrah", code: "HWH", city: "Kolkata", state: "West Bengal" },
      { name: "Bangalore City", code: "SBC", city: "Bangalore", state: "Karnataka" },
    ]);

    // Create train classes
    const trainClasses = await TrainClass.create([
      { name: "First Class AC", code: "1A", baseFare: 2000, isActive: true },
      { name: "Second Class AC", code: "2A", baseFare: 1500, isActive: true },
      { name: "Third Class AC", code: "3A", baseFare: 1000, isActive: true },
      { name: "Sleeper Class", code: "SL", baseFare: 500, isActive: true },
    ]);

    // Create trains
    const trains = await Train.create([
      {
        trainName: "Rajdhani Express",
        trainNumber: "12951",
        classes: trainClasses.map((tc) => tc._id),
        isActive: true,
      },
      {
        trainName: "Shatabdi Express",
        trainNumber: "12001",
        classes: trainClasses.map((tc) => tc._id),
        isActive: true,
      },
      {
        trainName: "Duronto Express",
        trainNumber: "12223",
        classes: trainClasses.map((tc) => tc._id),
        isActive: true,
      },
    ]);

    // Create routes (bi-directional)
    const routes = [];
    for (let i = 0; i < stations.length; i++) {
      for (let j = i + 1; j < stations.length; j++) {
        const distance = Math.floor(Math.random() * 1000) + 500; // Random distance between 500-1500 km
        const baseFare = Math.floor(distance * 2); // Base fare proportional to distance
        const estimatedDuration = Math.floor(distance / 60); // Rough estimate: 60 km/h average speed

        // Create route from station i to j
        routes.push({
          fromStation: stations[i]._id,
          toStation: stations[j]._id,
          distance,
          baseFare,
          estimatedDuration,
          availableClasses: trainClasses.map((tc) => tc._id),
          isActive: true,
        });

        // Create reverse route from station j to i
        routes.push({
          fromStation: stations[j]._id,
          toStation: stations[i]._id,
          distance,
          baseFare,
          estimatedDuration,
          availableClasses: trainClasses.map((tc) => tc._id),
          isActive: true,
        });
      }
    }
    await Route.create(routes);

    // Generate schedules for the next 14 days
    const schedules = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 0; day < 14; day++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + day);

      // For each route, create 2-4 schedules per day
    for (const route of routes) {
        const numSchedules = Math.floor(Math.random() * 3) + 2; // 2-4 schedules per day

        for (let i = 0; i < numSchedules; i++) {
          // Generate random departure time between 6 AM and 10 PM
          const departureHour = Math.floor(Math.random() * 16) + 6; // 6 AM to 10 PM
          const departureMinute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, or 45

          const departureTime = new Date(currentDate);
          departureTime.setHours(departureHour, departureMinute, 0, 0);

          // Calculate arrival time based on route duration
          const arrivalTime = new Date(departureTime);
          arrivalTime.setHours(
            departureTime.getHours() + route.estimatedDuration
          );

          // Generate random available seats for each class
          const availableSeats = {};
          for (const classId of route.availableClasses) {
            const trainClass = trainClasses.find(
              (tc) => tc._id.toString() === classId.toString()
            );
            if (trainClass) {
              availableSeats[trainClass.code] = Math.floor(Math.random() * 50) + 10; // 10-60 seats
            }
          }

          schedules.push({
            train: trains[Math.floor(Math.random() * trains.length)]._id,
            route: route._id,
            departureTime,
            arrivalTime,
            date: currentDate,
            availableSeats,
            status: "SCHEDULED",
            isActive: true,
          });
        }
      }
    }

    await Schedule.create(schedules);

    console.log("Database seeded successfully!");
    return { success: true };
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

export { seedData };

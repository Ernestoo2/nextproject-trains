import { connectDB } from "./connect";
import { Station } from "./models/Station";
import { TrainClass } from "./models/TrainClass";
import { Train } from "./models/Train";

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Station.deleteMany({});
    await TrainClass.deleteMany({});
    await Train.deleteMany({});

    // Create stations
    const stations = await Station.create([
      { name: "Port Harcourt", code: "PH", isActive: true },
      { name: "Enugu", code: "ENU", isActive: true },
      { name: "Lagos", code: "LOS", isActive: true },
      { name: "Abuja", code: "ABJ", isActive: true },
      { name: "Kano", code: "KAN", isActive: true },
      { name: "Kaduna", code: "KAD", isActive: true },
    ]);

    // Create train classes
    const classes = await TrainClass.create([
      { name: "First Class", code: "FC", isActive: true },
      { name: "Business Class", code: "BC", isActive: true },
      { name: "Standard Class", code: "SC", isActive: true },
    ]);

    // Create trains with routes
    await Train.create([
      {
        trainName: "PH ENUGU Express",
        trainNumber: "12430",
        routes: [
          {
            station: stations[0]._id,
            arrivalTime: "11:25",
            departureTime: "11:25",
            day: 1,
          },
          {
            station: stations[1]._id,
            arrivalTime: "07:25",
            departureTime: "07:25",
            day: 2,
          },
        ],
        classes: [classes[0]._id, classes[1]._id],
        isActive: true,
      },
      {
        trainName: "EBLE Express",
        trainNumber: "12320",
        routes: [
          {
            station: stations[0]._id,
            arrivalTime: "11:25",
            departureTime: "11:25",
            day: 1,
          },
          {
            station: stations[1]._id,
            arrivalTime: "07:25",
            departureTime: "07:25",
            day: 2,
          },
        ],
        classes: [classes[1]._id, classes[2]._id],
        isActive: true,
      },
      {
        trainName: "Lagos-Abuja Express",
        trainNumber: "12340",
        routes: [
          {
            station: stations[2]._id,
            arrivalTime: "08:00",
            departureTime: "08:30",
            day: 1,
          },
          {
            station: stations[3]._id,
            arrivalTime: "16:00",
            departureTime: "16:00",
            day: 1,
          },
        ],
        classes: [classes[0]._id, classes[1]._id, classes[2]._id],
        isActive: true,
      },
      {
        trainName: "Kano-Kaduna Express",
        trainNumber: "12350",
        routes: [
          {
            station: stations[4]._id,
            arrivalTime: "09:00",
            departureTime: "09:30",
            day: 1,
          },
          {
            station: stations[5]._id,
            arrivalTime: "13:00",
            departureTime: "13:00",
            day: 1,
          },
        ],
        classes: [classes[1]._id, classes[2]._id],
        isActive: true,
      },
    ]);

    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
};

export default seedData;

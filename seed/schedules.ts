import { connectDB } from '@/app/utils/mongodb/connect';
import { Schedule } from '@/app/utils/mongodb/models/Schedule';
import { Train } from '@/app/utils/mongodb/models/Train';
import { Route } from '@/app/utils/mongodb/models/Route';

async function seedSchedules() {
  try {
    await connectDB();

    // Clear existing schedules
    await Schedule.deleteMany({});

    // Get train and route IDs
    const trains = await Train.find({});
    const routes = await Route.find({});

    if (trains.length === 0 || routes.length === 0) {
      throw new Error('Required trains and routes not found. Please seed trains and routes first.');
    }

    const baseDate = new Date("2024-03-20");

    // Helper function to create a Date object with specific hours and minutes
    const createDateTime = (date: Date, timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const newDate = new Date(date);
      newDate.setHours(hours, minutes, 0, 0);
      return newDate;
    };

    // Create sample schedules
    const schedules = [
      {
        train: trains[0]._id,
        route: routes[0]._id,
        date: baseDate,
        departureTime: createDateTime(baseDate, "06:00"),
        arrivalTime: createDateTime(baseDate, "08:30"),
        status: "SCHEDULED",
        availableSeats: new Map([
          ["FC", 50],
          ["BC", 100],
          ["SC", 150]
        ]),
        platform: "1A",
        fareMultiplier: 1.0,
        delayedBy: 0,
        isActive: true
      },
      {
        train: trains[1]._id,
        route: routes[0]._id,
        date: baseDate,
        departureTime: createDateTime(baseDate, "11:00"),
        arrivalTime: createDateTime(baseDate, "13:30"),
        status: "SCHEDULED",
        availableSeats: new Map([
          ["FC", 50],
          ["BC", 100],
          ["SC", 150]
        ]),
        platform: "2B",
        fareMultiplier: 1.2,  // Peak hours multiplier
        delayedBy: 0,
        isActive: true
      },
      {
        train: trains[2]._id,
        route: routes[1]._id,
        date: baseDate,
        departureTime: createDateTime(baseDate, "16:00"),
        arrivalTime: createDateTime(baseDate, "18:30"),
        status: "SCHEDULED",
        availableSeats: new Map([
          ["FC", 40],
          ["BC", 80],
          ["SC", 120]
        ]),
        platform: "3A",
        fareMultiplier: 1.5,  // Peak evening multiplier
        delayedBy: 0,
        isActive: true
      },
      {
        train: trains[3]._id,
        route: routes[2]._id,
        date: baseDate,
        departureTime: createDateTime(baseDate, "21:00"),
        arrivalTime: createDateTime(baseDate, "23:30"),
        status: "SCHEDULED",
        availableSeats: new Map([
          ["FC", 30],
          ["BC", 60],
          ["SC", 90]
        ]),
        platform: "1B",
        fareMultiplier: 0.8,  // Night discount
        delayedBy: 0,
        isActive: true
      }
    ];

    await Schedule.insertMany(schedules);
    console.log('Schedules seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding schedules:', error);
    process.exit(1);
  }
}

seedSchedules(); 
import type { ITrain } from "@/types/shared/trains";

export const trainsData: Omit<ITrain, "_id">[] = [
  {
    trainName: "Nigerian Express",
    trainNumber: "NE001",
    routes: [],
    classes: [],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    capacity: 500,
    facilities: ["wifi", "food_service", "power_outlets", "air_conditioning"],
    status: "ACTIVE"
  },
  {
    trainName: "Capital Limited",
    trainNumber: "CL002",
    routes: [],
    classes: [],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    capacity: 400,
    facilities: ["wifi", "food_service", "power_outlets", "air_conditioning"],
    status: "ACTIVE"
  },
  {
    trainName: "Lagos Express",
    trainNumber: "LE003",
    routes: [],
    classes: [],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    capacity: 450,
    facilities: ["wifi", "food_service", "power_outlets", "air_conditioning"],
    status: "ACTIVE"
  },
  {
    trainName: "Abuja Shuttle",
    trainNumber: "AS004",
    routes: [],
    classes: [],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    capacity: 300,
    facilities: ["wifi", "food_service", "power_outlets", "air_conditioning"],
    status: "ACTIVE"
  },
  {
    trainName: "Kano Express",
    trainNumber: "KE005",
    routes: [],
    classes: [],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    capacity: 400,
    facilities: ["wifi", "food_service", "power_outlets", "air_conditioning"],
    status: "ACTIVE"
  },
  {
    trainName: "Port Harcourt Express",
    trainNumber: "PHE006",
    routes: [],
    classes: [],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    capacity: 450,
    facilities: ["wifi", "food_service", "power_outlets", "air_conditioning"],
    status: "ACTIVE"
  },
  {
    trainName: "Ibadan Express",
    trainNumber: "IE007",
    routes: [],
    classes: [],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    capacity: 350,
    facilities: ["wifi", "food_service", "power_outlets", "air_conditioning"],
    status: "ACTIVE"
  },
  {
    trainName: "Enugu Express",
    trainNumber: "EE008",
    routes: [],
    classes: [],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    capacity: 400,
    facilities: ["wifi", "food_service", "power_outlets", "air_conditioning"],
    status: "ACTIVE"
  },
  {
    trainName: "Kaduna Express",
    trainNumber: "KDE009",
    routes: [],
    classes: [],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    capacity: 350,
    facilities: ["wifi", "food_service", "power_outlets", "air_conditioning"],
    status: "ACTIVE"
  },
  {
    trainName: "Benin Express",
    trainNumber: "BE010",
    routes: [],
    classes: [],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    capacity: 400,
    facilities: ["wifi", "food_service", "power_outlets", "air_conditioning"],
    status: "ACTIVE"
  }
];

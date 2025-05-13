import { Station } from "@/types/shared";
import { Types } from "mongoose";

export const stationsData: Station[] = [
  {
    _id: new Types.ObjectId().toString(),
    stationName: "Abuja Central",
    stationCode: "ABJ",
    city: "Abuja",
    state: "Federal Capital Territory",
    region: "Central",
    address: "123 Main St, Abuja",
    platforms: 3,
    isActive: true,
    facilities: ["parking", "restrooms", "waiting_room", "ticket_office"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: new Types.ObjectId().toString(),
    stationName: "Kano Terminal",
    stationCode: "KAN",
    city: "Kano",
    state: "Kano",
    region: "North",
    address: "456 North Rd, Kano",
    platforms: 4,
    isActive: true,
    facilities: ["parking", "restrooms", "waiting_room", "ticket_office"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: new Types.ObjectId().toString(),
    stationName: "Port Harcourt Station",
    stationCode: "PHC",
    city: "Port Harcourt",
    state: "Rivers",
    region: "South",
    address: "789 River Ave, Port Harcourt",
    platforms: 2,
    isActive: true,
    facilities: ["parking", "restrooms", "waiting_room", "ticket_office"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: new Types.ObjectId().toString(),
    stationName: "Ibadan Central",
    stationCode: "IBD",
    city: "Ibadan",
    state: "Oyo",
    region: "West",
    address: "101 Ibadan Blvd, Ibadan",
    platforms: 3,
    isActive: true,
    facilities: ["parking", "restrooms", "waiting_room", "ticket_office"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: new Types.ObjectId().toString(),
    stationName: "Kaduna Station",
    stationCode: "KAD",
    city: "Kaduna",
    state: "Kaduna",
    region: "North",
    address: "202 Kaduna Rd, Kaduna",
    platforms: 2,
    isActive: true,
    facilities: ["parking", "restrooms", "waiting_room", "ticket_office"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: new Types.ObjectId().toString(),
    stationName: "Enugu Terminal",
    stationCode: "ENU",
    city: "Enugu",
    state: "Enugu",
    region: "East",
    address: "303 Enugu St, Enugu",
    platforms: 2,
    isActive: true,
    facilities: ["parking", "restrooms", "waiting_room", "ticket_office"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

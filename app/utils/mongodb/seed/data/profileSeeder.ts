import { connectDB } from "utils/mongodb/connect";
import { Profile } from "../../models/Profile";

const profiles = [
  {
    userId: "user1",
    naijaRailsId: "nr1",
    fullName: "John Doe",
    email: "john@example.com",
    phoneNumber: "+2348012345678",
    nationality: "Nigerian",
    defaultNationality: "Nigerian",
    preferredBerth: "lower",
    age: 30,
    gender: "male",
    address: "123 Main St, Lagos",
  },
  {
    userId: "user2",
    naijaRailsId: "nr2",
    fullName: "Jane Smith",
    email: "jane@example.com",
    phoneNumber: "+2348098765432",
    nationality: "Nigerian",
    defaultNationality: "Nigerian",
    preferredBerth: "upper",
    age: 28,
    gender: "female",
    address: "456 Broad St, Abuja",
  },
];

export const seedProfiles = async () => {
  try {
    await connectDB();
    await Profile.deleteMany({});
    await Profile.insertMany(profiles);
    console.log("Profiles seeded successfully");
  } catch (error) {
    console.error("Error seeding profiles:", error);
    throw error;
  }
};

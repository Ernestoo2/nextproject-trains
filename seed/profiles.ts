import { connectDB } from "@/utils/mongodb/connect";
import { Profile } from "@/utils/mongodb/models/Profile";

function generateNaijaRailsId(): string {
  const prefix = "NR";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${timestamp}-${random}`;
}

async function seedProfiles() {
  try {
    await connectDB();

    // Clear existing profiles
    await Profile.deleteMany({});

    const profiles = [
      {
        email: "kaluwilson@gmail.com",
        fullName: "Kalu Wilson",
        phoneNumber: "+2348123456789",
        nationality: "Nigerian",
        userId: "user1",
        defaultNationality: "Nigerian",
        preferredBerth: "lower",
        naijaRailsId: generateNaijaRailsId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "admin@naijarails.com",
        fullName: "Admin User",
        phoneNumber: "+2348123456780",
        nationality: "Nigerian",
        userId: "user2",
        defaultNationality: "Nigerian",
        preferredBerth: "upper",
        naijaRailsId: generateNaijaRailsId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "support@naijarails.com",
        fullName: "Support Team",
        phoneNumber: "+2348123456781",
        nationality: "Nigerian",
        userId: "user3",
        defaultNationality: "Nigerian",
        preferredBerth: "middle",
        naijaRailsId: generateNaijaRailsId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await Profile.insertMany(profiles);
    console.log("Successfully seeded profiles");
  } catch (error) {
    console.error("Error seeding profiles:", error);
    throw error;
  }
}

export { seedProfiles };

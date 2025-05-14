import {
  NaijaRailsProfile,
  NaijaRailsProfileResponse,
  NaijaRailsProfileUpdate,
} from "@/types/naija-rails.types";

export const createProfile = async (
  profile: Omit<
    NaijaRailsProfile,
    "_id" | "naijaRailsId" | "createdAt" | "updatedAt"
  >,
): Promise<NaijaRailsProfileResponse> => {
  try {
    // Get the userId or naijaRailsId
    const userId = profile.userId || profile.email; // Use email as fallback
    if (!userId) {
      return { success: false, error: "User identifier missing" };
    }

    const response = await fetch(`/api/user/${userId}`, {
      method: "PUT", // Using PUT since we're updating with initial values
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: "Failed to create profile" };
  }
};

export const updateProfile = async (
  profile: NaijaRailsProfileUpdate & { userId: string },
): Promise<NaijaRailsProfileResponse> => {
  try {
    if (!profile.userId) {
      return { success: false, error: "User identifier missing" };
    }

    const response = await fetch(`/api/user/${profile.userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: "Failed to update profile" };
  }
};

export const getProfile = async (
  userId: string,
): Promise<NaijaRailsProfileResponse> => {
  try {
    if (!userId) {
      return { success: false, error: "User identifier missing" };
    }

    const response = await fetch(`/api/user/${userId}`);
    return await response.json();
  } catch (error) {
    return { success: false, error: "Failed to fetch profile" };
  }
};

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
    const response = await fetch("/api/profiles", {
      method: "POST",
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
    const response = await fetch("/api/profiles", {
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
    const response = await fetch(`/api/profiles?userId=${userId}`);
    return await response.json();
  } catch (error) {
    return { success: false, error: "Failed to fetch profile" };
  }
};

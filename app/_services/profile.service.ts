import {
  NaijaRailsProfile,
  NaijaRailsProfileUpdate,
} from "@/types/naija-rails.types";
import { toast } from "sonner";

interface ProfileResponse {
  success: boolean;
  data?: NaijaRailsProfile;
  error?: string;
  details?: Record<string, string>;
}

export async function createProfile(
  profile: Omit<
    NaijaRailsProfile,
    "_id" | "naijaRailsId" | "createdAt" | "updatedAt"
  >,
): Promise<ProfileResponse> {
  try {
    const response = await fetch("/api/profiles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profile),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.details) {
        Object.entries(data.details).forEach(([field, message]) => {
          toast.error(`${field}: ${message}`);
        });
      }
      return {
        success: false,
        error: data.error || "Failed to create profile",
        details: data.details,
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error("Error creating profile:", error);
    toast.error("Failed to create profile");
    return {
      success: false,
      error: "Failed to create profile",
    };
  }
}

export async function updateProfile(
  profile: NaijaRailsProfileUpdate & { userId: string },
): Promise<ProfileResponse> {
  try {
    const response = await fetch("/api/profiles", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profile),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.details) {
        Object.entries(data.details).forEach(([field, message]) => {
          toast.error(`${field}: ${message}`);
        });
      }
      return {
        success: false,
        error: data.error || "Failed to update profile",
        details: data.details,
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error("Error updating profile:", error);
    toast.error("Failed to update profile");
    return {
      success: false,
      error: "Failed to update profile",
    };
  }
}

export async function getProfile(userId: string): Promise<ProfileResponse> {
  try {
    const response = await fetch(`/api/profiles?userId=${encodeURIComponent(userId)}`);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 404) {
        // Profile doesn't exist yet, return empty data
        return {
          success: true,
          data: undefined
        };
      }
      return {
        success: false,
        error: data.error || 'Failed to fetch profile'
      };
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error('Error fetching profile:', error);
    return {
      success: false,
      error: 'Failed to fetch profile'
    };
  }
}

import { UserProfile } from "@/types/shared/users";
import { toast } from "sonner";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  details?: Record<string, string>;
}

export async function updateProfile(
  naijaRailsId: string,
  updates: Partial<UserProfile>,
): Promise<ApiResponse<UserProfile>> {
  try {
    if (!naijaRailsId) {
      toast.error("User identifier (naijaRailsId) is missing for profile update.");
      return {
        success: false,
        message: "User identifier (naijaRailsId) is missing.",
      };
    }

    const response = await fetch(`/api/user/${naijaRailsId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const errorMessage = data.message || data.error || "Failed to update profile";
      if (data.details) {
        Object.entries(data.details).forEach(([field, message]) => {
          toast.error(`${field}: ${message}`);
        });
      } else {
        toast.error(errorMessage);
      }
      return {
        success: false,
        message: errorMessage,
        details: data.details,
      };
    }

    toast.success("Profile updated successfully!");
    return {
      success: true,
      data: data.data as UserProfile,
    };
  } catch (error) {
    console.error("Error updating profile:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during profile update.";
    toast.error(errorMessage);
    return {
      success: false,
      message: errorMessage,
    };
  }
}

export async function getProfile(naijaRailsId: string): Promise<ApiResponse<UserProfile | undefined>> {
  try {
    if (!naijaRailsId) {
      toast.error("User identifier (naijaRailsId) is missing for fetching profile.");
      return {
        success: false,
        message: "User identifier (naijaRailsId) is missing.",
      };
    }
    const response = await fetch(`/api/user/${naijaRailsId}`);
    const data = await response.json();

    if (!response.ok || !data.success) {
      if (response.status === 404) {
        return {
          success: true,
          data: undefined,
          message: data.message || "Profile not found",
        };
      }
      const errorMessage = data.message || data.error || "Failed to fetch profile";
      toast.error(errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }

    return {
      success: true,
      data: data.data as UserProfile,
    };
  } catch (error) {
    console.error('Error fetching profile:', error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred while fetching profile.";
    toast.error(errorMessage);
    return {
      success: false,
      message: errorMessage,
    };
  }
}

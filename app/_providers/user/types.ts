// Import the new canonical UserProfile
import { UserProfile as CanonicalUserProfile } from "@/types/shared/users";

// Re-export it for use within this module/context if needed, or use CanonicalUserProfile directly
export type UserProfile = CanonicalUserProfile;

export interface UserContextType {
  userProfile: UserProfile | null; // Will now refer to the canonical UserProfile
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  generateNaijaRailsId: () => string;
  isLoadingProfile: boolean;
}

import { create } from 'zustand';
import { UserProfile, UserProfileUpdate } from '@/types/shared/users';

interface UserProfileState {
    profile: UserProfile | null;
    isLoading: boolean;
    error: string | null;
    setProfile: (profile: UserProfile | null) => void;
    updateProfile: (updates: UserProfileUpdate) => Promise<void>;
    refreshProfile: () => Promise<void>;
    clearProfile: () => void;
}

export const useUserProfileStore = create<UserProfileState>((set, get) => ({
    profile: null,
    isLoading: false,
    error: null,

    setProfile: (profile) => set({ profile }),

    updateProfile: async (updates) => {
        const { profile } = get();
        if (!profile?.id) return;

        try {
            set({ isLoading: true, error: null });

            // Optimistic update
            set({
                profile: {
                    ...profile,
                    ...updates,
                },
            });

            // Make API call
            const response = await fetch(`/api/user/profile/${profile.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            const updatedProfile = await response.json();
            set({ profile: updatedProfile });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to update profile',
                // Rollback on error
                profile,
            });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    refreshProfile: async () => {
        const { profile } = get();
        if (!profile?.id) return;

        try {
            set({ isLoading: true, error: null });
            const response = await fetch(`/api/user/profile/${profile.id}`);

            if (!response.ok) {
                throw new Error('Failed to fetch profile');
            }

            const freshProfile = await response.json();
            set({ profile: freshProfile });
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to refresh profile' });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    clearProfile: () => set({ profile: null, error: null }),
}));

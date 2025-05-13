import { create } from 'zustand';
import { UserProfile, UserPreferences, UserDocument } from '@/types/shared/userApi';

interface UserStoreState {
  profile: UserProfile | null;
  preferences: UserPreferences | null;
  documents: UserDocument[];
  isLoading: boolean;
  error: string | null;
  actions: {
    setProfile: (profile: UserProfile) => void;
    updateProfile: (updates: Partial<UserProfile>) => void;
    setPreferences: (preferences: UserPreferences) => void;
    updatePreferences: (updates: Partial<UserPreferences>) => void;
    addDocument: (document: UserDocument) => void;
    removeDocument: (documentId: string) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    reset: () => void;
  };
}

const initialState = {
  profile: null,
  preferences: null,
  documents: [],
  isLoading: false,
  error: null,
};

export const useUserStore = create<UserStoreState>((set) => ({
  ...initialState,
  actions: {
    setProfile: (profile) => set({ profile }),
    updateProfile: (updates) =>
      set((state) => ({
        profile: state.profile ? { ...state.profile, ...updates } : null,
      })),
    setPreferences: (preferences) => set({ preferences }),
    updatePreferences: (updates) =>
      set((state) => ({
        preferences: state.preferences ? { ...state.preferences, ...updates } : null,
      })),
    addDocument: (document) =>
      set((state) => ({
        documents: [...state.documents, document],
      })),
    removeDocument: (documentId) =>
      set((state) => ({
        documents: state.documents.filter((doc) => doc.id !== documentId),
      })),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    reset: () => set(initialState),
  },
})); 
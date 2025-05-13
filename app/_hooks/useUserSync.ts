import { useEffect, useCallback } from 'react';
import { useUserStore } from '@/store/userStore';
import { UserProfile, UserPreferences, UserDocument } from '@/types/shared/userApi';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();

interface FetchOptions extends RequestInit {
  retries?: number;
}

export function useUserSync() {
  const { profile, actions } = useUserStore();

  const fetchWithRetry = useCallback(async (url: string, options: FetchOptions = {}): Promise<Response> => {
    const { retries = MAX_RETRIES, ...fetchOptions } = options;
    
    try {
      const response = await fetch(url, fetchOptions);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return fetchWithRetry(url, { ...options, retries: retries - 1 });
      }
      throw error;
    }
  }, []);

  const fetchWithCache = useCallback(async <T>(url: string): Promise<T> => {
    const cached = cache.get(url);
    const now = Date.now();

    if (cached && now - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    const response = await fetchWithRetry(url);
    const data = await response.json();

    cache.set(url, {
      data: data.data,
      timestamp: now
    });

    return data.data;
  }, [fetchWithRetry]);

  const updateWithOptimistic = useCallback(async <T>(
    url: string,
    method: 'PUT' | 'POST' | 'DELETE',
    data: any,
    optimisticUpdate: (data: any) => void,
    rollback: () => void
  ): Promise<T> => {
    try {
      // Apply optimistic update
      optimisticUpdate(data);

      // Make the actual request
      const response = await fetchWithRetry(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      // Update cache with new data
      cache.set(url, {
        data: result.data,
        timestamp: Date.now(),
      });

      return result.data;
    } catch (error) {
      // Rollback on error
      rollback();
      throw error;
    }
  }, [fetchWithRetry]);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        actions.setLoading(true);
        actions.setError(null);

        // Fetch profile
        const profileData = await fetchWithCache<UserProfile>('/api/profile');
        actions.setProfile(profileData);

        // Fetch preferences
        const preferencesData = await fetchWithCache<UserPreferences>('/api/profile/preferences');
        actions.setPreferences(preferencesData);

        // Fetch documents
        const documentsData = await fetchWithCache<UserDocument[]>('/api/profile/documents');
        documentsData.forEach((doc) => {
          actions.addDocument(doc);
        });
      } catch (error) {
        console.error('Error syncing user data:', error);
        actions.setError(error instanceof Error ? error.message : 'Failed to sync user data');
      } finally {
        actions.setLoading(false);
      }
    };

    if (!profile) {
      fetchUserData();
    }
  }, [profile, actions, fetchWithCache]);

  return {
    updateWithOptimistic,
  };
} 
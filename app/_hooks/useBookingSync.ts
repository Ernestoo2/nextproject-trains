import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useBookingStore } from '@/store/bookingStore';
import type { PromoCode, TrainClassType, Schedule } from '@/types/shared/trains';
import { toast } from 'sonner';

export function useBookingSync() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { bookingState, actions } = useBookingStore();

  // Sync URL to store on mount
  useEffect(() => {
    const routeId = searchParams.get('routeId');
    const scheduleId = searchParams.get('scheduleId');
    const classType = searchParams.get('classType') as TrainClassType | null;
    const promoCode = searchParams.get('promoCode') as PromoCode | null;
    const date = searchParams.get('date');

    // Only update if we have valid parameters
    if (routeId || scheduleId || classType || promoCode) {
      // Fetch route and schedule data if needed
      const fetchBookingData = async () => {
        try {
          if (routeId) {
            const routeResponse = await fetch(`/api/routes/${routeId}`);
            if (!routeResponse.ok) {
              throw new Error(`Failed to fetch route: ${routeResponse.statusText}`);
            }
            const routeData = await routeResponse.json();
            if (routeData.success) {
              actions.selectRoute(routeData.data);
            }
          }

          if (scheduleId) {
            // Include necessary query parameters
            const queryParams = new URLSearchParams({
              ...(classType && { class: classType }),
              ...(date && { date }),
              populate: 'train,route,departureStation,arrivalStation'
            });

            const scheduleResponse = await fetch(`/api/schedules/${scheduleId}?${queryParams}`);
            if (!scheduleResponse.ok) {
              throw new Error(`Failed to fetch schedule: ${scheduleResponse.statusText}`);
            }
            const scheduleData = await scheduleResponse.json();
            if (scheduleData.success) {
              actions.selectSchedule(scheduleData.data);
            }
          }

          if (classType) {
            actions.updateClass(classType);
          }

          if (promoCode) {
            actions.applyPromo(promoCode);
          }
        } catch (error) {
          console.error('Error syncing booking data:', error);
          // Show error toast instead of using store action
          toast.error(error instanceof Error ? error.message : 'Failed to sync booking data');
        }
      };

      fetchBookingData();
    }
  }, [searchParams, actions]);

  // Update URL when booking state changes
  const updateUrl = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (bookingState.bookingDetails?.schedule && typeof bookingState.bookingDetails.schedule !== 'string') {
      const schedule = bookingState.bookingDetails.schedule as Schedule;
      // Handle route which can be string or Route object
      const routeId = typeof schedule.route === 'string' ? schedule.route : schedule.route._id;
      params.set('routeId', routeId);
      params.set('scheduleId', schedule._id.toString());
    }
    
    if (bookingState.selectedClass) {
      params.set('classType', bookingState.selectedClass);
    }
    
    if (bookingState.promoCode) {
      params.set('promoCode', bookingState.promoCode);
    }

    router.replace(`?${params.toString()}`);
  };

  return {
    updateUrl,
  };
} 
import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useBookingStore } from '@/store/bookingStore';
import type { PromoCode, TrainClassType, Schedule } from '@/types/shared/trains';

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

    // Only update if we have valid parameters
    if (routeId || scheduleId || classType || promoCode) {
      // Fetch route and schedule data if needed
      const fetchBookingData = async () => {
        try {
          if (routeId) {
            const routeResponse = await fetch(`/api/routes/${routeId}`);
            if (routeResponse.ok) {
              const routeData = await routeResponse.json();
              actions.selectRoute(routeData.data);
            }
          }

          if (scheduleId) {
            const scheduleResponse = await fetch(`/api/schedules/${scheduleId}`);
            if (scheduleResponse.ok) {
              const scheduleData = await scheduleResponse.json();
              actions.selectScheduleAndClass(scheduleData.data, classType || 'ECONOMY');
            }
          }

          if (classType) {
            actions.updateCurrentDefaultClass(classType);
          }

          if (promoCode) {
            actions.applyPromoCode(promoCode);
          }
        } catch (error) {
          console.error('Error syncing booking data:', error);
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
# Refined Booking Process: Action Plan

This document outlines the steps to improve the train booking application, focusing on dynamic pricing and seat inventory management.

## 1. Current State Analysis & Goals

**Issues Identified:**

*   **Seat Depopulation:** `availableSeats` are not updated in the database after a successful booking.
*   **Static Pricing on Review Page:** The total price in `BookingRight.tsx` does not dynamically update when passengers are added/removed based on the selected class's fare.
*   **Consistent Use of Class-Specific Fares:** The system needs to reliably use the fare associated with the user's chosen travel class throughout the booking flow.

**Goals:**

*   Implement accurate, dynamic calculation of total fares on the review booking page.
*   Ensure that `availableSeats` are correctly decremented in the database upon successful payment.
*   Maintain a clear and robust flow of booking data (schedule, selected class, passenger details) through the components and state management.

## 2. Proposed Solution / Action Plan

### Phase 1: Dynamic Pricing in Review Booking

*   **Objective:** `BookingRight.tsx` correctly calculates and displays the total fare based on the number of passengers and the fare for their *selected class*.
*   **Steps:**
    1.  **Access Selected Class & Fare:**
        *   Confirm `review-booking/page.tsx` correctly retrieves `scheduleId` and `classId` (e.g., `EC1001`) from URL query parameters.
        *   Ensure this `classId` is stored in `useBookingStore` and accessible to `BookingRight.tsx`.
        *   The `schedule` data (fetched via `/api/schedules/[id]`) must provide the full `fare` object (e.g., `{ "EC1001": 1128, "FC2002": 2820 }`).
    2.  **Update `BookingRight.tsx` Logic:**
        *   Retrieve the specific fare for the `selectedClassId` from `schedule.fare[selectedClassId]`.
        *   When `bookingState.passengers.length` changes, recalculate:
            *   `totalBaseFare = fare_for_selected_class * numberOfPassengers`
            *   Update taxes and the final total amount displayed.
    3.  **Refine `useBookingStore`:**
        *   The store should hold:
            *   `selectedClassId`: The class code (e.g., "EC1001").
            *   `scheduleDetails`: The full schedule object including the nested `fare` and `availableSeats` objects.
            *   `passengers`: The array of passenger objects.
            *   Consider derived state within the store for `currentClassFarePerPassenger` and `calculatedTotalPrice` to centralize logic.

### Phase 2: Seat Depopulation (Inventory Management)

*   **Objective:** Decrease the `availableSeats` in the `Schedule` model in MongoDB after a booking is successfully paid for.
*   **Steps:**
    1.  **Create a New API Endpoint (e.g., `POST /api/bookings/confirm`):**
        *   **Request:** Accepts `scheduleId`, `classId`, and `numberOfSeatsBooked`.
        *   **Logic:**
            *   Connect to MongoDB.
            *   Find the `Schedule` document by `scheduleId`.
            *   Atomically decrement `availableSeats[classId]` by `numberOfSeatsBooked` (using MongoDB's `$inc` operator with a negative value). Ensure `availableSeats[classId]` does not go below zero.
            *   Consider adding error handling if seats cannot be decremented (e.g., not enough seats).
            *   (Optional but Recommended) Create a `Booking` document in a `bookings` collection, storing details of the confirmed booking.
        *   **Response:** Success or failure message.
    2.  **Integrate with Payment Flow (`payment/page.tsx`):**
        *   After a successful payment confirmation (e.g., in the `onSuccess` callback of the Paystack integration):
            *   Gather `scheduleId`, `selectedClassId`, and `numberOfPassengers` from `bookingDetails`.
            *   Make a `fetch` call to the new API endpoint (`POST /api/bookings/confirm`) with this data.
            *   Handle the API response (e.g., show a toast message for success/failure of final booking confirmation).

### Phase 3: (Future Consideration) Per-Traveler Class Selection

*   **User Suggestion:** Allow selecting a different class for each traveler within the "Add Traveler" modal.
*   **Implications:**
    *   The "Add Traveler" modal in `BookingLeft.tsx` would need a class selector dropdown.
    *   The `Passenger` object in `bookingState` would require a `selectedClassId` field.
    *   `BookingRight.tsx`'s fare calculation would need to sum fares based on each passenger's individual class choice.
    *   Seat depopulation logic would need to handle decrementing seats for potentially multiple classes within a single booking.
*   **Recommendation:** Implement Phases 1 and 2 first. This enhancement can be addressed subsequently due to its increased complexity.

## 3. Data Model Confirmations (from `utils/mongodb/models/Schedule.ts`)

*   The `Schedule` model should contain:
    *   `availableSeats: { [classId: string]: number }` (e.g., `{ "EC1001": 120, "FC2002": 60 }`)
    *   `fare: { [classId: string]: number }` (e.g., `{ "EC1001": 1128, "FC2002": 2820 }`)

This plan will be updated as we progress through the implementation. 
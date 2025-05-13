# Seed System Overview

## Core Logic

1.  **Stations**: Base station data is defined in `stations.data.ts`.
2.  **Train Classes**: Base class data is defined in `trainClasses.data.ts`.
3.  **Trains**: Base train definitions are in `trains.data.ts`.
4.  **Route Generation (`routes.data.ts`)**:
    *   Uses `generateAllRoutesRecursively` to create all possible N*(N-1) bidirectional routes between the 6 stations.
    *   Calculates distance randomly (100-1500km) and estimates duration (100km/h).
    *   Assigns all available `classIds` to each route.
5.  **Schedule Generation (`schedules.data.ts`)**:
    *   Uses `generateSchedulesRecursively` to create schedules for each route passed to it.
    *   Generates schedules for `MAX_SCHEDULE_DAYS` (21) consecutive days starting from a consistent "today".
    *   Creates 3 schedules per day using randomized time slots within operating hours.
    *   Calculates arrival time based on route's estimated duration.
    *   Calculates fare based on route distance and class multipliers.
    *   Assigns the correct departure date (`Date` object) to `schedule.date`.
    *   Assigns `trainId` passed from the orchestrator.
6.  **Seed Orchestrator (`seedOrchestrator.ts`)**:
    *   Clears existing collections.
    *   Seeds Stations, Train Classes, and Trains.
    *   Generates and inserts all 30 Routes using `generateAllRoutes`.
    *   Assigns routes to trains using `assignRoutesToTrainsRecursively` for reasonably even distribution.
    *   Calls `generateSchedulesForRoutes` for each train's assigned routes.
    *   Performs final validation using `validateAll` from `validation.ts`.
    *   Inserts all 1890 generated schedules using `Schedule.insertMany`.
    *   Logs final statistics.
7.  **Validation (`validation.ts`)**:
    *   `validateStationConnectivity`: Checks if all station pairs are connected via routes.
    *   `validateRouteClasses`: Checks if routes have valid class assignments.
    *   `validateScheduleCoverage`: Checks if each route has exactly 63 schedules covering 21 unique departure days (YYYY-MM-DD strings), and that all trains have schedules assigned.
    *   Uses Mongoose Document types and handles ObjectId/string comparisons correctly.

## Key Data Points

*   Stations: 6
*   Routes: 30 (6 * 5)
*   Trains: 10
*   Schedules per Route: 63 (21 days * 3 slots)
*   Total Schedules: 1890 (30 routes * 63 schedules/route)

## Database Indexes

*   **Schedule Collection**: Requires a unique compound index on `{ train: 1, route: 1, date: 1, departureTime: 1 }` to function correctly with the seed data. Any other unique indexes (especially on just `{ train: 1, route: 1, date: 1 }`) must be dropped from the MongoDB collection.

## Component Requirements Met

*   `FromToSelector`: All 30 routes are available.
*   `DateSelector`: Schedules cover a 21-day window.
*   `PassengerClassSelector`: Valid classes are assigned.
*   `TripSelector`: Routes are available. 
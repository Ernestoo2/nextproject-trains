export interface TrainDetails {
  id: number;
  trainName: string;
  runsOn: string;
  startDate: string;
  endDate: string;
  departureTime: string;
  arrivalTime: string;
  departureStation: string;
  arrivalStation: string;
  duration: string;
}

export interface TrainCardProps {
  train: TrainDetails;
}

export interface TrainSearchFormData {
  departure: string;
  arrival: string;
  date: string;
}

export interface TravelRoute {
  id: number;
  from: string;
  to: string;
  trip: string;
  Depart: string;
  Return: string;
  passenger: string;
  Class: string;
}

export interface RouteComponentProps {
  route: TravelRoute;
  onUpdate: (updatedRoute: Partial<TravelRoute>) => void;
}

export const initialTravelData: TravelRoute[] = [
  {
    id: 1,
    from: "Lahore",
    to: "Karachi",
    trip: "Return",
    Depart: "07 Nov 22",
    Return: "13 Nov 22",
    passenger: "1 Passenger",
    Class: "Economy",
  },
  {
    id: 2,
    from: "Islamabad",
    to: "Peshawar",
    trip: "One-way",
    Depart: "15 Dec 22",
    Return: "20 Dec 22",
    passenger: "2 Passengers",
    Class: "Business",
  },
  {
    id: 3,
    from: "Isman",
    to: "Ihie",
    trip: "One-way",
    Depart: "17 Aug 24",
    Return: "30 Dec 24",
    passenger: "2 Passengers",
    Class: "Business",
  },
  {
    id: 4,
    from: "Festac",
    to: "Patapa",
    trip: "One-way",
    Depart: "7 March 22",
    Return: "4 Nov 24",
    passenger: "2 Passengers",
    Class: "Business",
  },
];

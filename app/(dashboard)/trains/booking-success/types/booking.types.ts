export interface DateInfo {
  departure: string;
  arrival: string;
}

export interface TimeInfo {
  departure: string;
  arrival: string;
}

export interface LocationInfo {
  departure: string;
  arrival: string;
}

export interface TravellerInfo {
  name: string;
  age: string;
  gender: string;
  status: string;
  seat: string;
}

export interface TicketDetails {
  pnr: string;
  transactionId: string;
  train: string;
  date: DateInfo;
  time: TimeInfo;
  locations: LocationInfo;
  email: string;
  traveller: TravellerInfo;
  fare: string;
}

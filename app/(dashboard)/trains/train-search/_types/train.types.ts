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
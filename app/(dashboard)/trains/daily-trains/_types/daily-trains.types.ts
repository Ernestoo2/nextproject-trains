export interface DailyTrain {
  _id: string;
  trainNumber: string;
  trainName: string;
  departureTime: string;
  arrivalTime: string;
  departureStation: {
    _id: string;
    name: string;
    code: string;
  };
  arrivalStation: {
    _id: string;
    name: string;
    code: string;
  };
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  availableClasses: {
    code: string;
    name: string;
    availableSeats: number;
    baseFare: number;
  }[];
}

export interface DailyTrainsResponse {
  success: boolean;
  data: DailyTrain[];
  message?: string;
}

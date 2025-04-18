
export interface IStation {
  _id: string;
  name: string;
  code: string;
  isActive: boolean;
}

export interface ITrainClass {
  _id: string;
  name: string;
  code: string;
  baseFare: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IRoute {
  _id: string;
  fromStation: IStation;
  toStation: IStation;
  distance: number;
  baseFare: number;
  estimatedDuration: string;
  availableClasses: ITrainClass[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITrainRoute {
  station: IStation;
  arrivalTime: string;
  departureTime: string;
  day: number;
}

export interface ITrain {
  _id: string;
  trainName: string;
  trainNumber: string;
  routes: ITrainRoute[];
  classes: ITrainClass[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISchedule {
  _id: string;
  train: ITrain;
  route: IRoute;
  departureTime: string;
  arrivalTime: string;
  date: Date;
  status: 'SCHEDULED' | 'DELAYED' | 'CANCELLED' | 'COMPLETED';
  availableSeats: {
    FC: number;
    BC: number;
    SC: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Search result types
export interface ITrainSearchResult {
  _id: string;
  trainNumber: string;
  trainName: string;
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
  departureTime: string;
  arrivalTime: string;
  duration: string;
  availableClasses: Array<{
    _id: string;
    name: string;
    code: string;
    baseFare: number;
    availableSeats: number;
  }>;
  status: ISchedule['status'];
}

// API Response type
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

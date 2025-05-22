export interface RouteSummary {
  _id: string;
  fromStation: {
    _id: string;
    name: string;
    code: string;
  };
  toStation: {
    _id: string;
    name: string;
    code: string;
  };
  train: {
    _id: string;
    name: string;
  };
  route: {
    _id: string;
    distance: number;
    baseFare: number;
    estimatedDuration: string;
    availableClasses: Array<{
      name: string;
      code: string;
      baseFare: number;
    }>;
  };
  departureTime: string;
  arrivalTime: string;
  date: string;
  availableSeats: {
    FC: number;
    BC: number;
    SC: number;
  };
  status: string;
}

export interface DisplayRoute {
  _id: string;
  fromStation: {
    _id: string;
    name: string;
    code: string;
  };
  toStation: {
    _id: string;
    name: string;
    code: string;
  };
  distance: number;
  baseFare: number;
  estimatedDuration: string;
  availableClasses: Array<{
    name: string;
    code: string;
    baseFare: number;
  }>;
  train: {
    _id: string;
    name: string;
  };
}


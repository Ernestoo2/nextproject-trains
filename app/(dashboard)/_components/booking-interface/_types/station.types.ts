export interface Station {
  id: string;
  name: string;
  city: string;
  state: string;
  code: string;
}

export interface Route {
  from: Station;
  to: Station;
  distance: number;
} 
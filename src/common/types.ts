export interface Restaurant {
  name: string;
  city: string;
  area: string[];
  address: string;
  cuisine: string;
  notes: string;
  dined: boolean;
  coordinates?: [number, number]; // [lng, lat]
}

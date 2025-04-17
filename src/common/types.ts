export interface Restaurant {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  city: string;
  area: string[];
  address: string;
  cuisine: string;
  notes: string;
  dined: boolean;
}

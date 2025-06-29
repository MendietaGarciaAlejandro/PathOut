export interface POI {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  image?: string;
  categoryId?: string;
}

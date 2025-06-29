import { RoutePath } from '../services/routeService';

export interface Route {
  id: number;
  name: string;
  description?: string;
  poiIds: number[];
  createdAt: number;
  isPublic: boolean;
  color: string;
  routePath?: RoutePath; // Ruta calculada con puntos, distancia y duración
  totalDistance?: number; // Distancia total en metros
  totalDuration?: number; // Duración total en segundos
}

export interface RoutePoint {
  poiId: number;
  order: number;
}

export const ROUTE_COLORS = [
  '#FF6B6B', // Rojo
  '#4ECDC4', // Turquesa
  '#45B7D1', // Azul
  '#96CEB4', // Verde
  '#FFEAA7', // Amarillo
  '#DDA0DD', // Púrpura
  '#98D8C8', // Verde claro
  '#F7DC6F', // Amarillo dorado
  '#BB8FCE', // Violeta
  '#85C1E9', // Azul claro
]; 
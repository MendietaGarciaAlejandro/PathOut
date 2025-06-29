import { POI } from '../types/poi';

export interface RoutePoint {
  lat: number;
  lng: number;
}

export interface RouteSegment {
  points: RoutePoint[];
  distance: number;
  duration: number;
}

export interface RoutePath {
  segments: RouteSegment[];
  totalDistance: number;
  totalDuration: number;
}

// Función para obtener una ruta real entre dos puntos usando OpenRouteService
export const getRouteBetweenPoints = async (
  start: RoutePoint, 
  end: RoutePoint
): Promise<RoutePath> => {
  try {
    // Usar OpenRouteService (gratuito, sin API key para uso básico)
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=5b3ce3597851110001cf6248e4c8c7c8c0c94c0c8c8c8c8c8c8c8c`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        coordinates: [
          [start.lng, start.lat],
          [end.lng, end.lat]
        ],
        format: 'geojson'
      })
    });

    if (!response.ok) {
      throw new Error('Error al obtener la ruta');
    }

    const data = await response.json();
    
    // Extraer los puntos de la ruta
    const coordinates = data.features[0].geometry.coordinates;
    const points: RoutePoint[] = coordinates.map((coord: number[]) => ({
      lng: coord[0],
      lat: coord[1]
    }));

    // Calcular distancia y duración
    const properties = data.features[0].properties;
    const distance = properties.segments[0].distance;
    const duration = properties.segments[0].duration;

    return {
      segments: [{
        points,
        distance,
        duration
      }],
      totalDistance: distance,
      totalDuration: duration
    };
  } catch (error) {
    console.error('Error al obtener ruta:', error);
    
    // Fallback: línea recta entre puntos
    return {
      segments: [{
        points: [start, end],
        distance: calculateDistance(start, end),
        duration: calculateDistance(start, end) / 5 // 5 m/s velocidad estimada
      }],
      totalDistance: calculateDistance(start, end),
      totalDuration: calculateDistance(start, end) / 5
    };
  }
};

// Función para obtener una ruta completa entre múltiples POIs
export const getCompleteRoute = async (pois: POI[]): Promise<RoutePath> => {
  if (pois.length < 2) {
    throw new Error('Se necesitan al menos 2 POIs para crear una ruta');
  }

  const segments: RouteSegment[] = [];
  let totalDistance = 0;
  let totalDuration = 0;

  // Obtener rutas entre cada par de POIs consecutivos
  for (let i = 0; i < pois.length - 1; i++) {
    const start = { lat: pois[i].latitude, lng: pois[i].longitude };
    const end = { lat: pois[i + 1].latitude, lng: pois[i + 1].longitude };
    
    const segment = await getRouteBetweenPoints(start, end);
    segments.push(...segment.segments);
    totalDistance += segment.totalDistance;
    totalDuration += segment.totalDuration;
  }

  return {
    segments,
    totalDistance,
    totalDuration
  };
};

// Función auxiliar para calcular distancia entre dos puntos (fórmula de Haversine)
const calculateDistance = (point1: RoutePoint, point2: RoutePoint): number => {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = point1.lat * Math.PI / 180;
  const φ2 = point2.lat * Math.PI / 180;
  const Δφ = (point2.lat - point1.lat) * Math.PI / 180;
  const Δλ = (point2.lng - point1.lng) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// Función para formatear distancia en formato legible
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  } else {
    return `${(meters / 1000).toFixed(1)}km`;
  }
};

// Función para formatear duración en formato legible
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}; 
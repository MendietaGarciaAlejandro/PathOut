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

// Función para obtener una ruta real entre dos puntos usando OSRM (gratuito, sin API key)
export const getRouteBetweenPoints = async (
  start: RoutePoint, 
  end: RoutePoint
): Promise<RoutePath> => {
  console.log('getRouteBetweenPoints: Iniciando con puntos:', { start, end });
  try {
    // Usar OSRM (Open Source Routing Machine) - completamente gratuito, sin API key
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
    
    console.log('getRouteBetweenPoints: Haciendo petición a OSRM...');
    const response = await fetch(url);

    if (!response.ok) {
      console.log('getRouteBetweenPoints: Error en respuesta:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('getRouteBetweenPoints: Error detallado:', errorText);
      throw new Error(`Error al obtener la ruta: ${response.status}`);
    }

    const data = await response.json();
    console.log('getRouteBetweenPoints: Respuesta recibida:', data);
    
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('No se pudo calcular la ruta');
    }
    
    // Extraer los puntos de la ruta
    const coordinates = data.routes[0].geometry.coordinates;
    const points: RoutePoint[] = coordinates.map((coord: number[]) => ({
      lng: coord[0],
      lat: coord[1]
    }));

    console.log('getRouteBetweenPoints: Puntos extraídos:', points);

    // Calcular distancia y duración
    const route = data.routes[0];
    const distance = route.distance; // en metros
    const duration = route.duration; // en segundos

    const result = {
      segments: [{
        points,
        distance,
        duration
      }],
      totalDistance: distance,
      totalDuration: duration
    };

    console.log('getRouteBetweenPoints: Resultado final:', result);
    return result;
  } catch (error) {
    console.error('getRouteBetweenPoints: Error al obtener ruta:', error);
    
    // Fallback: simulación de ruta que no sea completamente recta
    console.log('getRouteBetweenPoints: Usando fallback (simulación de calles)');
    
    // Calcular puntos intermedios para simular una ruta que no sea completamente recta
    const points: RoutePoint[] = [];
    const steps = 15; // Más puntos para una ruta más suave
    
    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps;
      const lat = start.lat + (end.lat - start.lat) * ratio;
      const lng = start.lng + (end.lng - start.lng) * ratio;
      
      // Agregar variaciones para simular que sigue las calles
      const variation = Math.sin(ratio * Math.PI) * 0.0002; // Variación más pronunciada
      points.push({
        lat: lat + variation,
        lng: lng + variation
      });
    }

    const distance = calculateDistance(start, end);
    const duration = distance / 5; // 5 m/s velocidad estimada

    const fallbackResult = {
      segments: [{
        points,
        distance,
        duration
      }],
      totalDistance: distance,
      totalDuration: duration
    };
    
    console.log('getRouteBetweenPoints: Resultado fallback:', fallbackResult);
    return fallbackResult;
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
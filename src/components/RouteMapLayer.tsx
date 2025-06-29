import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { Route } from '../types/route';
import { getCompleteRoute, formatDistance, formatDuration } from '../services/routeService';
import { POI } from '../types/poi';

interface RouteMapLayerProps {
  selectedRoute: Route | null;
  pois: POI[];
}

const RouteMapLayer: React.FC<RouteMapLayerProps> = ({ selectedRoute, pois }) => {
  const [routePath, setRoutePath] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedRoute && selectedRoute.poiIds.length >= 2) {
      loadRoutePath();
    } else {
      setRoutePath(null);
    }
  }, [selectedRoute]);

  const loadRoutePath = async () => {
    if (!selectedRoute) return;

    setLoading(true);
    try {
      // Obtener los POIs de la ruta en el orden correcto
      const routePOIs = selectedRoute.poiIds
        .map(id => pois.find(poi => poi.id === id))
        .filter((poi): poi is POI => poi !== undefined);

      if (routePOIs.length < 2) {
        console.log('No hay suficientes POIs para calcular la ruta');
        return;
      }

      console.log('Calculando ruta para:', selectedRoute.name);
      console.log('POIs de la ruta:', routePOIs.map(p => p.name));

      const path = await getCompleteRoute(routePOIs);
      
      // Convertir los puntos para Leaflet
      const leafletPath = path.segments.flatMap(segment => 
        segment.points.map(point => [point.lat, point.lng])
      );

      setRoutePath({
        coordinates: leafletPath,
        distance: path.totalDistance,
        duration: path.totalDuration,
        color: selectedRoute.color
      });

      console.log('Ruta calculada:', {
        distance: formatDistance(path.totalDistance),
        duration: formatDuration(path.totalDuration),
        points: leafletPath.length
      });

    } catch (error) {
      console.error('Error al calcular la ruta:', error);
      setRoutePath(null);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedRoute || !routePath) {
    return null;
  }

  // Este componente no renderiza nada directamente
  // Los datos se pasan al componente padre para renderizar en el mapa
  return null;
};

export default RouteMapLayer; 
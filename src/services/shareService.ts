import { POI } from '../types/poi';
import { Route } from '../types/route';

export interface ShareData {
  type: 'poi' | 'route';
  data: POI | Route;
  timestamp: number;
}

export const sharePOI = async (poi: POI) => {
  try {
    const shareData: ShareData = {
      type: 'poi',
      data: poi,
      timestamp: Date.now(),
    };

    const shareText = `📍 ${poi.name}\n\n${poi.description}\n\n📍 Ubicación: ${poi.latitude.toFixed(6)}, ${poi.longitude.toFixed(6)}\n\nCompartido desde PathOut`;

    if (navigator.share) {
      await navigator.share({
        title: poi.name,
        text: shareText,
        url: `https://maps.google.com/?q=${poi.latitude},${poi.longitude}`,
      });
    } else {
      // Fallback para navegadores que no soportan Web Share API
      await copyToClipboard(shareText);
      alert('Información del POI copiada al portapapeles');
    }

    return true;
  } catch (error) {
    console.error('Error al compartir POI:', error);
    return false;
  }
};

export const shareRoute = async (route: Route, pois: POI[]) => {
  try {
    const routePOIs = route.poiIds
      .map(id => pois.find(poi => poi.id === id))
      .filter(Boolean);

    const shareData: ShareData = {
      type: 'route',
      data: route,
      timestamp: Date.now(),
    };

    let shareText = `🗺️ ${route.name}\n\n`;
    
    if (route.description) {
      shareText += `${route.description}\n\n`;
    }

    shareText += `📍 Ruta:\n`;
    routePOIs.forEach((poi, index) => {
      shareText += `${index + 1}. ${poi?.name}\n`;
    });

    shareText += `\nTotal: ${routePOIs.length} puntos de interés\n`;
    shareText += `\nCompartido desde PathOut`;

    if (navigator.share) {
      await navigator.share({
        title: route.name,
        text: shareText,
      });
    } else {
      // Fallback para navegadores que no soportan Web Share API
      await copyToClipboard(shareText);
      alert('Información de la ruta copiada al portapapeles');
    }

    return true;
  } catch (error) {
    console.error('Error al compartir ruta:', error);
    return false;
  }
};

export const shareMultiplePOIs = async (pois: POI[]) => {
  try {
    const shareText = `📍 Colección de POIs\n\n${pois.map((poi, index) => 
      `${index + 1}. ${poi.name} - ${poi.description}`
    ).join('\n')}\n\nCompartido desde PathOut`;

    if (navigator.share) {
      await navigator.share({
        title: 'Colección de POIs',
        text: shareText,
      });
    } else {
      await copyToClipboard(shareText);
      alert('Colección de POIs copiada al portapapeles');
    }

    return true;
  } catch (error) {
    console.error('Error al compartir múltiples POIs:', error);
    return false;
  }
};

const copyToClipboard = async (text: string) => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback para navegadores más antiguos
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  } catch (error) {
    console.error('Error al copiar al portapapeles:', error);
    throw error;
  }
};

export const generateShareLink = (type: 'poi' | 'route', id: number) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/share/${type}/${id}`;
};

export const exportToGPX = (pois: POI[], routeName?: string) => {
  const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="PathOut" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${routeName || 'POIs de PathOut'}</name>
    <time>${new Date().toISOString()}</time>
  </metadata>
  ${pois.map(poi => `
  <wpt lat="${poi.latitude}" lon="${poi.longitude}">
    <name>${poi.name}</name>
    <desc>${poi.description}</desc>
    ${poi.categoryId ? `<type>${poi.categoryId}</type>` : ''}
  </wpt>`).join('')}
</gpx>`;

  const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${routeName || 'pois'}.gpx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportToKML = (pois: POI[], routeName?: string) => {
  const kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${routeName || 'POIs de PathOut'}</name>
    <description>Exportado desde PathOut</description>
    ${pois.map(poi => `
    <Placemark>
      <name>${poi.name}</name>
      <description>${poi.description}</description>
      <Point>
        <coordinates>${poi.longitude},${poi.latitude},0</coordinates>
      </Point>
    </Placemark>`).join('')}
  </Document>
</kml>`;

  const blob = new Blob([kmlContent], { type: 'application/vnd.google-earth.kml+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${routeName || 'pois'}.kml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}; 
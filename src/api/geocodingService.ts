// Servicio para buscar lugares usando Nominatim (OpenStreetMap)
export const searchPlaces = async (query: string) => {
  if (!query) return [];
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  const data = await res.json();
  // Devuelve solo los campos relevantes
  return data.map((item: any) => ({
    name: item.display_name,
    latitude: parseFloat(item.lat),
    longitude: parseFloat(item.lon),
  }));
};

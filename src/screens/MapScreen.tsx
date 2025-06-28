import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Platform, Text } from 'react-native';
import { POI } from '../types/poi';
import db from '../services/dbService';

const MapScreen = () => {
  const [pois, setPOIs] = useState<POI[]>([]);

  useEffect(() => {
    db.transaction((tx: any) => {
      tx.executeSql(
        'SELECT * FROM pois',
        [],
        (_: any, { rows }: any) => {
          setPOIs(rows._array || []);
        }
      );
    });
  }, []);

  if (Platform.OS === 'web') {
    // Web: usar react-leaflet
    const { MapContainer, TileLayer, Marker: LeafletMarker, Popup } = require('react-leaflet');
    const L = require('leaflet');
    // Fix iconos leaflet en web
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
    return (
      <div style={{ width: '100vw', height: '100vh' }}>
        <MapContainer
          center={[pois[0]?.latitude || 40.4168, pois[0]?.longitude || -3.7038]}
          zoom={15}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {pois.map(poi => (
            <LeafletMarker key={poi.id} position={[poi.latitude, poi.longitude]}>
              <Popup>
                <b>{poi.name}</b><br />{poi.description}
              </Popup>
            </LeafletMarker>
          ))}
        </MapContainer>
      </div>
    );
  }

  // Móvil: importar react-native-maps solo aquí
  let MapView: any = null;
  let Marker: any = null;
  // Forzar el tipo para evitar el warning de TypeScript
  if ((Platform.OS as string) === 'ios' || (Platform.OS as string) === 'android') {
    const maps = require('react-native-maps');
    MapView = maps.default;
    Marker = maps.Marker;
  }

  return (
    <View style={styles.container}>
      {MapView ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: pois[0]?.latitude || 40.4168,
            longitude: pois[0]?.longitude || -3.7038,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          {pois.map(poi => (
            <Marker
              key={poi.id}
              coordinate={{ latitude: poi.latitude, longitude: poi.longitude }}
              title={poi.name}
              description={poi.description}
            />
          ))}
        </MapView>
      ) : (
        <Text>No se pudo cargar el mapa.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

export default MapScreen;

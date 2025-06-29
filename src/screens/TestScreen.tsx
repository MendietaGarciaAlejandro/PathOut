import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { setPOIs, addPOIAsync } from '../redux/slices/poiSlice';
import { POI } from '../types/poi';

const TestScreen = () => {
  const dispatch = useDispatch();
  const pois = useSelector((state: RootState) => state.poi.pois);
  const loading = useSelector((state: RootState) => state.poi.loading);
  const error = useSelector((state: RootState) => state.poi.error);

  console.log('TestScreen: Renderizando con pois:', pois);

  const handleAddTestPOI = () => {
    console.log('TestScreen: Agregando POI de prueba');
    const testPOI: POI = {
      id: Date.now(),
      name: 'POI Test ' + Date.now(),
      description: 'Descripción de prueba',
      latitude: 40.4168,
      longitude: -3.7038,
      category: 'Test'
    };
    
    // Probar ambos métodos
    dispatch(setPOIs([...pois, testPOI]));
    console.log('TestScreen: POI agregado directamente al estado');
  };

  const handleAddAsyncPOI = async () => {
    console.log('TestScreen: Agregando POI con async thunk');
    const testPOI: POI = {
      id: Date.now(),
      name: 'POI Async ' + Date.now(),
      description: 'Descripción async',
      latitude: 40.4168,
      longitude: -3.7038,
      category: 'Async'
    };
    
    await dispatch(addPOIAsync(testPOI) as any);
    console.log('TestScreen: POI agregado con async thunk');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pantalla de Prueba - Redux</Text>
      
      <View style={styles.info}>
        <Text>Estado de carga: {loading ? 'Cargando...' : 'No cargando'}</Text>
        <Text>Error: {error || 'Ninguno'}</Text>
        <Text>Número de POIs: {pois.length}</Text>
      </View>

      <View style={styles.buttons}>
        <Button title="Agregar POI Directo" onPress={handleAddTestPOI} />
        <Button title="Agregar POI Async" onPress={handleAddAsyncPOI} />
      </View>

      <View style={styles.poiList}>
        <Text style={styles.listTitle}>Lista de POIs:</Text>
        {pois.map((poi, index) => (
          <View key={poi.id} style={styles.poiItem}>
            <Text style={styles.poiName}>{poi.name}</Text>
            <Text style={styles.poiDesc}>{poi.description}</Text>
            <Text style={styles.poiCoords}>
              {poi.latitude}, {poi.longitude}
            </Text>
          </View>
        ))}
        {pois.length === 0 && (
          <Text style={styles.emptyText}>No hay POIs</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  info: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  poiList: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  poiItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 10,
  },
  poiName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  poiDesc: {
    fontSize: 14,
    color: '#666',
  },
  poiCoords: {
    fontSize: 12,
    color: '#999',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
});

export default TestScreen; 
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Text, Modal, TextInput, Button, Alert, FlatList, TouchableOpacity } from 'react-native';
import { POI } from '../types/poi';
import db from '../services/dbServiceConfig';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { setPOIs, addPOIAsync, clearError, removePOIAsync } from '../redux/slices/poiSlice';
import { fetchFavorites, addFavoriteAsync, removeFavoriteAsync } from '../redux/slices/favoritesSlice';
import ErrorMessage from '../components/ErrorMessage';
import POICard from '../components/POICard';
import 'leaflet/dist/leaflet.css';

// Log básico para verificar que el archivo se está cargando
console.log('MainMapScreen.web.tsx: Archivo cargado');

const MainMapScreen = () => {
  console.log('MainMapScreen.web: Componente iniciando');
  
  const dispatch = useDispatch();
  const pois = useSelector((state: RootState) => state.poi.pois);
  const favoriteIds = useSelector((state: RootState) => state.favorites.favorites);
  const error = useSelector((state: RootState) => state.poi.error);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPOI, setNewPOI] = useState<Partial<POI>>({});
  const [loading, setLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);

  console.log('MainMapScreen.web: Estado inicial - pois:', pois, 'favoriteIds:', favoriteIds);

  // Función para cargar POIs desde la base de datos
  const loadPOIsFromDB = async () => {
    try {
      console.log('MainMapScreen.web: Cargando POIs desde la base de datos...');
      const loadedPOIs = await db.getPOIs();
      console.log('MainMapScreen.web: POIs cargados desde DB:', loadedPOIs);
      dispatch(setPOIs(loadedPOIs));
    } catch (error) {
      console.error('MainMapScreen.web: Error al cargar POIs desde DB:', error);
      // Si hay error, usar datos de prueba
      const testPOIs: POI[] = [
        {
          id: 1,
          name: 'Punto de prueba',
          description: 'Este es un punto de prueba',
          latitude: 40.4168,
          longitude: -3.7038,
          category: 'Test'
        }
      ];
      dispatch(setPOIs(testPOIs));
    }
  };

  // Monitorear cambios en el estado de POIs
  useEffect(() => {
    console.log('MainMapScreen.web: Estado de POIs actualizado:', pois);
  }, [pois]);

  useEffect(() => {
    console.log('MainMapScreen.web: useEffect ejecutado');
    // Cargar POIs desde la base de datos
    loadPOIsFromDB();
    dispatch(fetchFavorites() as any);
  }, [dispatch]); // Solo dependencia en dispatch, no en pois

  const handleMapPress = (e: any) => {
    console.log('MainMapScreen.web: handleMapPress llamado');
    console.log('MainMapScreen.web: e.latlng:', e.latlng);
    
    // Verificar si las coordenadas están en lat/lng en lugar de latitude/longitude
    const lat = e.latlng?.lat || e.latlng?.latitude;
    const lng = e.latlng?.lng || e.latlng?.longitude;
    
    console.log('MainMapScreen.web: lat extraída:', lat);
    console.log('MainMapScreen.web: lng extraída:', lng);
    
    if (lat && lng) {
      setNewPOI({ latitude: lat, longitude: lng });
      console.log('MainMapScreen.web: newPOI establecido con:', { latitude: lat, longitude: lng });
      setModalVisible(true);
    } else {
      console.error('MainMapScreen.web: No se pudieron extraer las coordenadas del evento');
    }
  };

  const handleAddPOI = async () => {
    console.log('MainMapScreen.web: handleAddPOI llamado');
    console.log('MainMapScreen.web: newPOI actual:', newPOI);
    
    if (!newPOI.name || !newPOI.latitude || !newPOI.longitude) {
      console.log('MainMapScreen.web: Validación fallida - datos faltantes');
      Alert.alert('Error', 'Por favor completa al menos el nombre del punto de interés');
      return;
    }

    setLoading(true);
    console.log('MainMapScreen.web: Loading establecido en true');
    
    try {
      const poi: POI = {
        id: Date.now(),
        name: newPOI.name,
        description: newPOI.description || '',
        latitude: newPOI.latitude,
        longitude: newPOI.longitude,
        image: newPOI.image,
        category: newPOI.category,
      };
      
      console.log('MainMapScreen.web: POI creado:', poi);
      console.log('MainMapScreen.web: Estado actual de POIs antes de dispatch:', pois);
      
      const result = await dispatch(addPOIAsync(poi) as any);
      console.log('MainMapScreen.web: Resultado del dispatch:', result);
      
      setModalVisible(false);
      setNewPOI({});
      
      console.log('MainMapScreen.web: Modal cerrado y newPOI reseteado');
      Alert.alert('Éxito', 'Punto de interés agregado correctamente');
    } catch (error) {
      console.error('MainMapScreen.web: Error en handleAddPOI:', error);
      Alert.alert('Error', 'No se pudo agregar el punto de interés');
    } finally {
      setLoading(false);
      console.log('MainMapScreen.web: Loading establecido en false');
    }
  };

  // Función de prueba para agregar un POI directamente al estado
  const handleTestAddPOI = () => {
    console.log('MainMapScreen.web: handleTestAddPOI llamado');
    const testPOI: POI = {
      id: Date.now(),
      name: 'POI de prueba ' + Date.now(),
      description: 'Descripción de prueba',
      latitude: 40.4168,
      longitude: -3.7038,
      category: 'Test'
    };
    console.log('MainMapScreen.web: Agregando POI de prueba:', testPOI);
    dispatch(setPOIs([...pois, testPOI]));
    console.log('MainMapScreen.web: POI de prueba agregado, estado actual:', [...pois, testPOI]);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setNewPOI({});
  };

  const handleDismissError = () => {
    dispatch(clearError());
  };

  const handleToggleFavorite = (poiId: number) => {
    if (favoriteIds.includes(poiId)) {
      dispatch(removeFavoriteAsync(poiId) as any);
    } else {
      dispatch(addFavoriteAsync(poiId) as any);
    }
  };

  const handleDeletePOI = async (poiId: number) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que quieres eliminar este punto de interés?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(removePOIAsync(poiId) as any);
              Alert.alert('Éxito', 'Punto de interés eliminado');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el punto de interés');
            }
          },
        },
      ]
    );
  };

  const handlePOISelect = (poi: POI) => {
    setSelectedPOI(poi);
  };

  // Leaflet components
  const { MapContainer, TileLayer, Marker: LeafletMarker, Popup, useMapEvents } = require('react-leaflet');
  const L = require('leaflet');
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });

  function MapClickHandler() {
    useMapEvents({
      click: handleMapPress,
    });
    return null;
  }

  const defaultLat = pois[0]?.latitude || 40.4168;
  const defaultLng = pois[0]?.longitude || -3.7038;

  console.log('MainMapScreen.web: Renderizando componente');

  return (
    <View style={styles.container}>
      {error && <ErrorMessage message={error} onDismiss={handleDismissError} />}
      
      {/* Sidebar con lista de POIs */}
      {showSidebar && (
        <View style={styles.sidebar}>
          <View style={styles.sidebarHeader}>
            <Text style={styles.sidebarTitle}>Puntos de Interés ({pois.length})</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.testButton}
                onPress={handleTestAddPOI}
              >
                <Text style={styles.testButtonText}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.toggleButton}
                onPress={() => setShowSidebar(false)}
              >
                <Text style={styles.toggleButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Lista simplificada para debugging */}
          <View style={styles.poiListContainer}>
            <Text style={styles.debugText}>Debug: {pois.length} POIs en estado</Text>
            <FlatList
              data={pois}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item, index }) => {
                console.log('MainMapScreen.web: FlatList renderizando POI:', item, 'índice:', index);
                return (
                  <View style={styles.poiItem}>
                    <POICard poi={item} />
                    <View style={styles.poiActions}>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleToggleFavorite(item.id)}
                      >
                        <Text style={styles.actionButtonText}>
                          {favoriteIds.includes(item.id) ? '❤️' : '🤍'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => handleDeletePOI(item.id)}
                      >
                        <Text style={styles.deleteButtonText}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
              ListEmptyComponent={() => (
                <Text style={styles.emptyText}>
                  No hay puntos de interés. Toca en el mapa para agregar uno.
                </Text>
              )}
              extraData={pois.length} // Forzar re-render cuando cambia el número de POIs
              removeClippedSubviews={false} // Evitar problemas de renderizado en web
              getItemLayout={(data, index) => ({
                length: 120, // Altura estimada de cada item
                offset: 120 * index,
                index,
              })}
            />
          </View>
        </View>
      )}

      {/* Botón para mostrar sidebar */}
      {!showSidebar && (
        <TouchableOpacity 
          style={styles.showSidebarButton}
          onPress={() => setShowSidebar(true)}
        >
          <Text style={styles.showSidebarButtonText}>☰</Text>
        </TouchableOpacity>
      )}

      {/* Mapa */}
      <View style={[styles.mapContainer, !showSidebar && styles.mapContainerFull]}>
        <MapContainer
          center={[defaultLat, defaultLng]}
          zoom={15}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapClickHandler />
          {pois.map(poi => (
            <LeafletMarker 
              key={poi.id} 
              position={[poi.latitude, poi.longitude]}
              eventHandlers={{
                click: () => handlePOISelect(poi),
              }}
            >
              <Popup>
                <b>{poi.name}</b><br />
                {poi.description && <span>{poi.description}<br /></span>}
                {poi.category && <span>Categoría: {poi.category}</span>}
              </Popup>
            </LeafletMarker>
          ))}
        </MapContainer>
      </View>
      
      {/* Modal para agregar POI */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nuevo Punto de Interés</Text>
            
            <TextInput 
              placeholder="Nombre *" 
              style={styles.input} 
              value={newPOI.name || ''} 
              onChangeText={t => setNewPOI({ ...newPOI, name: t })}
            />
            
            <TextInput 
              placeholder="Descripción" 
              style={styles.input} 
              value={newPOI.description || ''} 
              onChangeText={t => setNewPOI({ ...newPOI, description: t })}
              multiline
            />
            
            <Text style={styles.coords}>
              Lat: {newPOI.latitude?.toFixed(6)}, Lon: {newPOI.longitude?.toFixed(6)}
            </Text>
            
            <TextInput 
              placeholder="Categoría" 
              style={styles.input} 
              value={newPOI.category || ''} 
              onChangeText={t => setNewPOI({ ...newPOI, category: t })}
            />
            
            <View style={styles.modalBtns}>
              <Button 
                title="Cancelar" 
                onPress={handleCancel}
                disabled={loading}
              />
              <Button 
                title={loading ? "Guardando..." : "Guardar"} 
                onPress={handleAddPOI}
                disabled={loading}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 350,
    backgroundColor: '#f5f5f5',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleButton: {
    padding: 5,
  },
  toggleButtonText: {
    fontSize: 20,
    color: '#666',
  },
  poiItem: {
    margin: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  poiActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    padding: 8,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
  },
  actionButtonText: {
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
  deleteButtonText: {
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    margin: 20,
  },
  showSidebarButton: {
    position: 'absolute',
    top: 50,
    left: 10,
    zIndex: 1000,
    backgroundColor: '#fff',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  showSidebarButtonText: {
    fontSize: 20,
  },
  mapContainer: {
    flex: 1,
  },
  mapContainerFull: {
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  coords: {
    color: '#666',
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalBtns: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testButton: {
    padding: 5,
  },
  testButtonText: {
    fontSize: 20,
    color: '#666',
  },
  poiListContainer: {
    flex: 1,
    padding: 10,
  },
  debugText: {
    color: '#666',
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
  },
  poiName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  poiDesc: {
    color: '#666',
    marginBottom: 5,
  },
  poiCoords: {
    color: '#999',
    fontSize: 12,
    marginBottom: 5,
  },
});

export default MainMapScreen; 
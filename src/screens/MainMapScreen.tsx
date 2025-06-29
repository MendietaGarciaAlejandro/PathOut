import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Text, Modal, TextInput, Button, Alert, FlatList, TouchableOpacity } from 'react-native';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import { POI } from '../types/poi';
import db from '../services/dbServiceConfig';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { setPOIs, addPOIAsync, clearError, removePOIAsync } from '../redux/slices/poiSlice';
import { fetchFavorites, addFavoriteAsync, removeFavoriteAsync } from '../redux/slices/favoritesSlice';
import ErrorMessage from '../components/ErrorMessage';
import POICard from '../components/POICard';

const MainMapScreen = () => {
  const dispatch = useDispatch();
  const pois = useSelector((state: RootState) => state.poi.pois);
  const favoriteIds = useSelector((state: RootState) => state.favorites.favorites);
  const error = useSelector((state: RootState) => state.poi.error);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPOI, setNewPOI] = useState<Partial<POI>>({});
  const [loading, setLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);

  useEffect(() => {
    loadPOIs();
    dispatch(fetchFavorites() as any);
  }, []);

  const loadPOIs = () => {
    db.transaction((tx: any) => {
      tx.executeSql('SELECT * FROM pois', [], (_: any, { rows }: any) => {
        dispatch(setPOIs(rows._array || []));
      });
    });
  };

  const handleMapPress = (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setNewPOI({ latitude, longitude });
    setModalVisible(true);
  };

  const handleAddPOI = async () => {
    if (!newPOI.name || !newPOI.latitude || !newPOI.longitude) {
      Alert.alert('Error', 'Por favor completa al menos el nombre del punto de interés');
      return;
    }

    setLoading(true);
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
      
      await dispatch(addPOIAsync(poi) as any);
      setModalVisible(false);
      setNewPOI({});
      
      setTimeout(() => {
        loadPOIs();
      }, 100);
      
      Alert.alert('Éxito', 'Punto de interés agregado correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo agregar el punto de interés');
      console.error('Error adding POI:', error);
    } finally {
      setLoading(false);
    }
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

  return (
    <View style={styles.container}>
      {error && <ErrorMessage message={error} onDismiss={handleDismissError} />}
      
      {/* Sidebar con lista de POIs */}
      {showSidebar && (
        <View style={styles.sidebar}>
          <View style={styles.sidebarHeader}>
            <Text style={styles.sidebarTitle}>Puntos de Interés</Text>
            <TouchableOpacity 
              style={styles.toggleButton}
              onPress={() => setShowSidebar(false)}
            >
              <Text style={styles.toggleButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={pois}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
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
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No hay puntos de interés. Toca en el mapa para agregar uno.
              </Text>
            }
          />
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
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: pois[0]?.latitude || 40.4168,
            longitude: pois[0]?.longitude || -3.7038,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          onPress={handleMapPress}
        >
          {pois.map(poi => (
            <Marker
              key={poi.id}
              coordinate={{ latitude: poi.latitude, longitude: poi.longitude }}
              title={poi.name}
              description={poi.description}
              onPress={() => handlePOISelect(poi)}
            />
          ))}
        </MapView>
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
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
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
});

export default MainMapScreen; 
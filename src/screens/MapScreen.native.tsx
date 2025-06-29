import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Text, Modal, TextInput, Button, Alert } from 'react-native';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import { POI } from '../types/poi';
import db from '../services/dbService';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { setPOIs, addPOIAsync, clearError } from '../redux/slices/poiSlice';
import ErrorMessage from '../components/ErrorMessage';

const MapScreen = () => {
  const dispatch = useDispatch();
  const pois = useSelector((state: RootState) => state.poi.pois);
  const error = useSelector((state: RootState) => state.poi.error);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPOI, setNewPOI] = useState<Partial<POI>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPOIs();
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
      
      // Recargar POIs después de un breve delay
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

  return (
    <View style={styles.container}>
      {error && <ErrorMessage message={error} onDismiss={handleDismissError} />}
      
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
          />
        ))}
      </MapView>
      
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

export default MapScreen;

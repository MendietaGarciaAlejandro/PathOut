import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Text, Modal, TextInput, Button } from 'react-native';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import { POI } from '../types/poi';
import db from '../services/dbService';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { setPOIs, addPOIAsync } from '../redux/slices/poiSlice';

const MapScreen = () => {
  const dispatch = useDispatch();
  const pois = useSelector((state: RootState) => state.poi.pois);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPOI, setNewPOI] = useState<Partial<POI>>({});

  useEffect(() => {
    db.transaction((tx: any) => {
      tx.executeSql('SELECT * FROM pois', [], (_: any, { rows }: any) => {
        dispatch(setPOIs(rows._array || []));
      });
    });
  }, [dispatch]);

  const handleMapPress = (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setNewPOI({ latitude, longitude });
    setModalVisible(true);
  };

  const handleAddPOI = () => {
    if (!newPOI.name || !newPOI.latitude || !newPOI.longitude) return;
    const poi: POI = {
      id: Date.now(),
      name: newPOI.name,
      description: newPOI.description || '',
      latitude: newPOI.latitude,
      longitude: newPOI.longitude,
      image: newPOI.image,
      category: newPOI.category,
    };
    dispatch(addPOIAsync(poi) as any);
    setModalVisible(false);
    setNewPOI({});
  };

  return (
    <View style={styles.container}>
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
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Nuevo Punto de Interés</Text>
          <TextInput placeholder="Nombre" style={styles.input} value={newPOI.name || ''} onChangeText={t => setNewPOI({ ...newPOI, name: t })} />
          <TextInput placeholder="Descripción" style={styles.input} value={newPOI.description || ''} onChangeText={t => setNewPOI({ ...newPOI, description: t })} />
          <Text style={styles.coords}>Lat: {newPOI.latitude}, Lon: {newPOI.longitude}</Text>
          <TextInput placeholder="Categoría" style={styles.input} value={newPOI.category || ''} onChangeText={t => setNewPOI({ ...newPOI, category: t })} />
          <View style={styles.modalBtns}>
            <Button title="Cancelar" onPress={() => setModalVisible(false)} />
            <Button title="Guardar" onPress={handleAddPOI} />
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
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  coords: {
    textAlign: 'center',
    marginBottom: 12,
    color: '#888',
  },
  modalBtns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
});

export default MapScreen;

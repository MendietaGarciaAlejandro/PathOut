import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text, Modal, TextInput, Button } from 'react-native';
import POICard from '../components/POICard';
import { POI } from '../types/poi';
import SearchBar from '../components/SearchBar';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { setPOIs, addPOIAsync } from '../redux/slices/poiSlice';
import { fetchFavorites, addFavoriteAsync, removeFavoriteAsync } from '../redux/slices/favoritesSlice';
import db from '../services/dbService';
import { searchPlaces } from '../api/geocodingService';

const HomeScreen = () => {
  const dispatch = useDispatch();
  const pois = useSelector((state: RootState) => state.poi.pois);
  const favoriteIds = useSelector((state: RootState) => state.favorites.favorites);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [newPOI, setNewPOI] = useState<Partial<POI>>({});
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    db.transaction((tx: any) => {
      tx.executeSql('SELECT * FROM pois', [], (_: any, { rows }: any) => {
        dispatch(setPOIs(rows._array || []));
      });
    });
    dispatch(fetchFavorites() as any);
  }, [dispatch]);

  const filteredPOIs = pois.filter(poi =>
    poi.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleFavorite = (poiId: number) => {
    if (favoriteIds.includes(poiId)) {
      dispatch(removeFavoriteAsync(poiId) as any);
    } else {
      dispatch(addFavoriteAsync(poiId) as any);
    }
  };

  const handleAddPOI = () => {
    if (!newPOI.name || !newPOI.latitude || !newPOI.longitude) return;
    const poi: POI = {
      id: Date.now(),
      name: newPOI.name,
      description: newPOI.description || '',
      latitude: Number(newPOI.latitude),
      longitude: Number(newPOI.longitude),
      image: newPOI.image,
      category: newPOI.category,
    };
    dispatch(addPOIAsync(poi) as any);
    setModalVisible(false);
    setNewPOI({});
  };

  const handleSearchChange = async (text: string) => {
    setSearch(text);
    if (text.length > 2) {
      const results = await searchPlaces(text);
      setSuggestions(results);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion: any) => {
    setShowSuggestions(false);
    setSearch('');
    setSuggestions([]);
    setModalVisible(false);
    // Añadir como POI
    const poi: POI = {
      id: Date.now(),
      name: suggestion.name,
      description: '',
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
      image: undefined,
      category: undefined,
    };
    dispatch(addPOIAsync(poi) as any);
  };

  return (
    <View style={styles.container}>
      <SearchBar value={search} onChange={handleSearchChange} placeholder="Buscar lugares..." />
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsBox}>
          {suggestions.map((s, i) => (
            <TouchableOpacity key={i} onPress={() => handleSelectSuggestion(s)} style={styles.suggestionItem}>
              <Text>{s.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
        <Text style={styles.addBtnText}>+ Añadir nuevo punto</Text>
      </TouchableOpacity>
      <FlatList
        data={filteredPOIs}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View>
            <POICard poi={item} />
            <TouchableOpacity style={styles.favBtn} onPress={() => handleToggleFavorite(item.id)}>
              <Text style={styles.favBtnText}>
                {favoriteIds.includes(item.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Nuevo Punto de Interés</Text>
          <TextInput placeholder="Nombre" style={styles.input} value={newPOI.name || ''} onChangeText={t => setNewPOI({ ...newPOI, name: t })} />
          <TextInput placeholder="Descripción" style={styles.input} value={newPOI.description || ''} onChangeText={t => setNewPOI({ ...newPOI, description: t })} />
          <TextInput placeholder="Latitud" style={styles.input} value={newPOI.latitude?.toString() || ''} onChangeText={t => setNewPOI({ ...newPOI, latitude: Number(t) })} keyboardType="numeric" />
          <TextInput placeholder="Longitud" style={styles.input} value={newPOI.longitude?.toString() || ''} onChangeText={t => setNewPOI({ ...newPOI, longitude: Number(t) })} keyboardType="numeric" />
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
    backgroundColor: '#f9f9f9',
    paddingTop: 8,
  },
  addBtn: {
    backgroundColor: '#007bff',
    margin: 16,
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  favBtn: {
    backgroundColor: '#ffeedd',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
  },
  favBtnText: {
    color: '#b76e00',
    fontWeight: 'bold',
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
  modalBtns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  suggestionsBox: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    marginHorizontal: 16,
    marginBottom: 8,
    maxHeight: 180,
    zIndex: 10,
  },
  suggestionItem: {
    padding: 12,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
});

export default HomeScreen;

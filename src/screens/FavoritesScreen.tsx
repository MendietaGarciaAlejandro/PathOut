import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import POICard from '../components/POICard';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { fetchFavorites, removeFavoriteAsync } from '../redux/slices/favoritesSlice';
import { setPOIs } from '../redux/slices/poiSlice';
import db from '../services/dbService';

const FavoritesScreen = () => {
  const dispatch = useDispatch();
  const favoriteIds = useSelector((state: RootState) => state.favorites.favorites);
  const pois = useSelector((state: RootState) => state.poi.pois);
  const favoritePOIs = pois.filter(poi => favoriteIds.includes(poi.id));

  useEffect(() => {
    dispatch(fetchFavorites() as any);
    // Cargar POIs si no están en Redux
    db.transaction((tx: any) => {
      tx.executeSql('SELECT * FROM pois', [], (_: any, { rows }: any) => {
        dispatch(setPOIs(rows._array || []));
      });
    });
  }, [dispatch]);

  const handleRemoveFavorite = (poiId: number) => {
    dispatch(removeFavoriteAsync(poiId) as any);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tus Favoritos</Text>
      <FlatList
        data={favoritePOIs}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View>
            <POICard poi={item} />
            <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemoveFavorite(item.id)}>
              <Text style={styles.removeText}>Quitar de favoritos</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No tienes favoritos aún.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingTop: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 16,
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    marginTop: 32,
  },
  removeBtn: {
    backgroundColor: '#ffdddd',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
  },
  removeText: {
    color: '#c00',
    fontWeight: 'bold',
  },
});

export default FavoritesScreen;

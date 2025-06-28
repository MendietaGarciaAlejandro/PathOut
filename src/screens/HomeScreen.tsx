import React from 'react';
import { View, FlatList } from 'react-native';
import POICard from '../components/POICard';
import { POI } from '../types/poi';

const dummyPOIs: POI[] = [
  { id: 1, name: 'Catedral', description: 'La catedral principal de la ciudad.', latitude: 0, longitude: 0 },
  { id: 2, name: 'Museo de Arte', description: 'Museo con exposiciones locales.', latitude: 0, longitude: 0 },
];

const HomeScreen = () => (
  <View>
    <FlatList
      data={dummyPOIs}
      keyExtractor={item => item.id.toString()}
      renderItem={({ item }) => <POICard poi={item} />}
    />
  </View>
);

export default HomeScreen;

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const AppNavigator = () => (
    <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
        <Tab.Screen name="Mapa" component={MapScreen} />
        <Tab.Screen name="Favoritos" component={FavoritesScreen} />
        <Tab.Screen name="Ajustes" component={SettingsScreen} />
    </Tab.Navigator>
);

export default AppNavigator;

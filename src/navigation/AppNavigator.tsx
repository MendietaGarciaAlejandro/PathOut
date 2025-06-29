import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

// Importar la versión correcta según la plataforma
let MainMapScreen: any;
console.log('AppNavigator: Platform.OS =', Platform.OS);

if (Platform.OS === 'web') {
  console.log('AppNavigator: Cargando MainMapScreen.web');
  MainMapScreen = require('../screens/MainMapScreen.web').default;
} else {
  console.log('AppNavigator: Cargando MainMapScreen');
  MainMapScreen = require('../screens/MainMapScreen').default;
}

console.log('AppNavigator: MainMapScreen cargado:', MainMapScreen);

const AppNavigator = () => (
    <Tab.Navigator>
        <Tab.Screen 
            name="Mapa" 
            component={MainMapScreen} 
            options={{ 
                title: 'PathOut',
                headerShown: false 
            }} 
        />
        <Tab.Screen 
            name="Ajustes" 
            component={SettingsScreen} 
            options={{ 
                title: 'Ajustes',
                headerShown: true 
            }} 
        />
    </Tab.Navigator>
);

export default AppNavigator;

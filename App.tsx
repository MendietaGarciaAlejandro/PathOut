import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import AppNavigator from './src/navigation/AppNavigator';
import store from './src/redux/store';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { initDB } from './src/services/dbServiceConfig';

export default function App() {
  useEffect(() => {
    // Inicializar la base de datos al arrancar la aplicación
    console.log('App: Inicializando base de datos...');
    initDB()
      .then(() => {
        console.log('App: Base de datos inicializada correctamente');
      })
      .catch((error: any) => {
        console.error('App: Error al inicializar la base de datos:', error);
      });
  }, []);

  return (
    <Provider store={store}>
      <NavigationContainer>
        <AppNavigator />
        <StatusBar style="auto" />
      </NavigationContainer>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

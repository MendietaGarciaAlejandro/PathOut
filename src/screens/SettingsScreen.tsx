import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Platform } from 'react-native';
import { useDispatch } from 'react-redux';
import { setPOIs } from '../redux/slices/poiSlice';
import db from '../services/dbServiceConfig';

const SettingsScreen = () => {
  const dispatch = useDispatch();

  const handleClearData = () => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que quieres eliminar todos los puntos de interés? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar todo',
          style: 'destructive',
          onPress: () => {
            db.transaction((tx: any) => {
              tx.executeSql('DELETE FROM pois', [], () => {
                tx.executeSql('DELETE FROM favorites', [], () => {
                  dispatch(setPOIs([]));
                  Alert.alert('Éxito', 'Todos los datos han sido eliminados');
                });
              });
            });
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    db.transaction((tx: any) => {
      tx.executeSql('SELECT * FROM pois', [], (_: any, { rows }: any) => {
        const pois = rows._array || [];
        const dataStr = JSON.stringify(pois, null, 2);
        
        if (Platform.OS === 'web') {
          // En web, descargar como archivo
          const dataBlob = new Blob([dataStr], { type: 'application/json' });
          const url = URL.createObjectURL(dataBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'pathout_pois.json';
          link.click();
          URL.revokeObjectURL(url);
        } else {
          // En móvil, mostrar en alerta
          Alert.alert('Datos exportados', `Se encontraron ${pois.length} puntos de interés`);
        }
      });
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Datos</Text>
        
        <TouchableOpacity style={styles.option} onPress={handleExportData}>
          <Text style={styles.optionText}>Exportar puntos de interés</Text>
          <Text style={styles.optionDescription}>
            Descarga todos tus puntos de interés como archivo JSON
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.option, styles.dangerOption]} onPress={handleClearData}>
          <Text style={[styles.optionText, styles.dangerText]}>Eliminar todos los datos</Text>
          <Text style={styles.optionDescription}>
            Elimina permanentemente todos los puntos de interés
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información</Text>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Versión</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Desarrollado por</Text>
          <Text style={styles.infoValue}>PathOut Team</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  option: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  dangerOption: {
    borderBottomWidth: 0,
  },
  dangerText: {
    color: '#d32f2f',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#333',
  },
  infoValue: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});

export default SettingsScreen;

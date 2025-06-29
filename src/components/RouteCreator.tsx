import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { createRouteAsync } from '../redux/slices/routeSlice';
import { Route, ROUTE_COLORS } from '../types/route';
import { POI } from '../types/poi';

interface RouteCreatorProps {
  onClose: () => void;
}

const RouteCreator: React.FC<RouteCreatorProps> = ({ onClose }) => {
  const dispatch = useDispatch();
  const pois = useSelector((state: RootState) => state.poi.pois);
  const loading = useSelector((state: RootState) => state.route.loading);

  const [routeName, setRouteName] = useState('');
  const [routeDescription, setRouteDescription] = useState('');
  const [selectedPOIs, setSelectedPOIs] = useState<number[]>([]);
  const [selectedColor, setSelectedColor] = useState(ROUTE_COLORS[0]);
  const [isPublic, setIsPublic] = useState(false);

  const handlePOIToggle = (poiId: number) => {
    setSelectedPOIs(prev => {
      if (prev.includes(poiId)) {
        return prev.filter(id => id !== poiId);
      } else {
        return [...prev, poiId];
      }
    });
  };

  const handleCreateRoute = async () => {
    if (!routeName.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para la ruta');
      return;
    }

    if (selectedPOIs.length < 2) {
      Alert.alert('Error', 'Una ruta debe tener al menos 2 puntos de interés');
      return;
    }

    const newRoute: Route = {
      id: Date.now(),
      name: routeName.trim(),
      description: routeDescription.trim() || undefined,
      poiIds: selectedPOIs,
      createdAt: Date.now(),
      isPublic,
      color: selectedColor,
    };

    try {
      await dispatch(createRouteAsync(newRoute) as any);
      Alert.alert('Éxito', 'Ruta creada correctamente');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear la ruta');
    }
  };

  const getSelectedPOINames = () => {
    return selectedPOIs
      .map(id => pois.find(poi => poi.id === id)?.name)
      .filter(Boolean)
      .join(' → ');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Nueva Ruta</Text>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.label}>Nombre de la ruta *</Text>
          <TextInput
            style={styles.input}
            value={routeName}
            onChangeText={setRouteName}
            placeholder="Ej: Ruta del centro histórico"
            maxLength={50}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Descripción (opcional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={routeDescription}
            onChangeText={setRouteDescription}
            placeholder="Describe tu ruta..."
            multiline
            numberOfLines={3}
            maxLength={200}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Color de la ruta</Text>
          <View style={styles.colorContainer}>
            {ROUTE_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  selectedColor === color && styles.selectedColor
                ]}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setIsPublic(!isPublic)}
          >
            <View style={[styles.checkbox, isPublic && styles.checkboxChecked]} />
            <Text style={styles.checkboxLabel}>Ruta pública</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Seleccionar POIs ({selectedPOIs.length}/2+)</Text>
          {selectedPOIs.length > 0 && (
            <Text style={styles.routePreview}>
              Ruta: {getSelectedPOINames()}
            </Text>
          )}
          <ScrollView style={styles.poiList} horizontal>
            {pois.map((poi) => (
              <TouchableOpacity
                key={poi.id}
                style={[
                  styles.poiItem,
                  selectedPOIs.includes(poi.id) && styles.selectedPOI
                ]}
                onPress={() => handlePOIToggle(poi.id)}
              >
                <Text style={[
                  styles.poiName,
                  selectedPOIs.includes(poi.id) && styles.selectedPOIName
                ]}>
                  {poi.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.createButton, loading && styles.disabledButton]}
          onPress={handleCreateRoute}
          disabled={loading}
        >
          <Text style={styles.createButtonText}>
            {loading ? 'Creando...' : 'Crear Ruta'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  selectedColor: {
    borderColor: '#333',
    borderWidth: 3,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },
  routePreview: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  poiList: {
    maxHeight: 100,
  },
  poiItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedPOI: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  poiName: {
    fontSize: 14,
    color: '#333',
  },
  selectedPOIName: {
    color: '#fff',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  createButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default RouteCreator; 
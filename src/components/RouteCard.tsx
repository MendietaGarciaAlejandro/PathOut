import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { deleteRouteAsync, setSelectedRoute } from '../redux/slices/routeSlice';
import { Route } from '../types/route';

interface RouteCardProps {
  route: Route;
  onPress?: () => void;
  onShare?: () => void;
}

const RouteCard: React.FC<RouteCardProps> = ({ route, onPress, onShare }) => {
  const dispatch = useDispatch();
  const pois = useSelector((state: RootState) => state.poi.pois);

  const handleDelete = () => {
    console.log('🗑️ RouteCard: Botón eliminar presionado para ruta:', route.name, 'ID:', route.id);
    Alert.alert(
      'Eliminar Ruta',
      `¿Estás seguro de que quieres eliminar la ruta "${route.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            console.log('🗑️ RouteCard: Confirmación de eliminación aceptada');
            dispatch(deleteRouteAsync(route.id) as any);
          },
        },
      ]
    );
  };

  const handleSelect = () => {
    dispatch(setSelectedRoute(route));
    if (onPress) onPress();
  };

  const handleShare = () => {
    if (onShare) onShare();
  };

  const getRoutePOIs = () => {
    return route.poiIds
      .map(id => pois.find(poi => poi.id === id))
      .filter(Boolean);
  };

  const routePOIs = getRoutePOIs();
  const startPOI = routePOIs[0];
  const endPOI = routePOIs[routePOIs.length - 1];

  return (
    <TouchableOpacity style={styles.container} onPress={handleSelect}>
      <View style={styles.header}>
        <View style={[styles.colorIndicator, { backgroundColor: route.color }]} />
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{route.name}</Text>
          {route.isPublic && (
            <View style={styles.publicBadge}>
              <Text style={styles.publicText}>Pública</Text>
            </View>
          )}
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.shareText}>📤</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteText}>×</Text>
          </TouchableOpacity>
        </View>
      </View>

      {route.description && (
        <Text style={styles.description}>{route.description}</Text>
      )}

      <View style={styles.routeInfo}>
        <View style={styles.routePoints}>
          <Text style={styles.routeLabel}>Ruta:</Text>
          <Text style={styles.routeText}>
            {startPOI?.name} → {endPOI?.name}
          </Text>
        </View>
        <Text style={styles.poiCount}>
          {routePOIs.length} punto{routePOIs.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.date}>
          Creada: {new Date(route.createdAt).toLocaleDateString('es-ES')}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  publicBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  publicText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  shareText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  routeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  routePoints: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  routeText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  poiCount: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
});

export default RouteCard; 
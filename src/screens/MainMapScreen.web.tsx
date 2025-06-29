import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Text, Modal, TextInput, Button, Alert, FlatList, TouchableOpacity } from 'react-native';
import { POI } from '../types/poi';
import { CATEGORIES, Category, getCategoryById } from '../types/categories';
import { Route } from '../types/route';
import { getPOIs } from '../services/dbService.web';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { setPOIs, addPOIAsync, clearError, removePOIAsync } from '../redux/slices/poiSlice';
import { fetchFavorites, addFavoriteAsync, removeFavoriteAsync } from '../redux/slices/favoritesSlice';
import { fetchRoutesAsync, setSelectedRoute, clearSelectedRoute } from '../redux/slices/routeSlice';
import { sharePOI, shareRoute, shareMultiplePOIs, exportToGPX, exportToKML } from '../services/shareService';
import ErrorMessage from '../components/ErrorMessage';
import POICard from '../components/POICard';
import RouteCard from '../components/RouteCard';
import RouteCreator from '../components/RouteCreator';
import ImagePicker from '../components/ImagePicker';
import 'leaflet/dist/leaflet.css';
import RouteMapLayer from '../components/RouteMapLayer';
import { getCompleteRoute, formatDistance, formatDuration } from '../services/routeService';

const MainMapScreen = () => {
  const dispatch = useDispatch();
  const pois = useSelector((state: RootState) => state.poi.pois);
  const favoriteIds = useSelector((state: RootState) => state.favorites.favorites);
  const routes = useSelector((state: RootState) => state.route.routes);
  const selectedRoute = useSelector((state: RootState) => state.route.selectedRoute);
  const error = useSelector((state: RootState) => state.poi.error);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPOI, setNewPOI] = useState<Partial<POI>>({});
  const [loading, setLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [poiToDelete, setPoiToDelete] = useState<number | null>(null);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRouteCreator, setShowRouteCreator] = useState(false);
  const [showRoutes, setShowRoutes] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareType, setShareType] = useState<'poi' | 'route' | 'multiple'>('poi');
  const [itemToShare, setItemToShare] = useState<POI | Route | null>(null);
  const [routePath, setRoutePath] = useState<any>(null);
  const [routeLoading, setRouteLoading] = useState(false);

  // Función para cargar POIs desde la base de datos
  const loadPOIsFromDB = async () => {
    try {
      const loadedPOIs = await getPOIs();
      dispatch(setPOIs(loadedPOIs));
    } catch (error) {
      console.error('Error al cargar POIs desde DB:', error);
      // Si hay error, usar datos de prueba
      const testPOIs: POI[] = [
        {
          id: 1,
          name: 'Punto de prueba',
          description: 'Este es un punto de prueba',
          latitude: 40.4168,
          longitude: -3.7038,
          categoryId: 'otros'
        }
      ];
      dispatch(setPOIs(testPOIs));
    }
  };

  useEffect(() => {
    loadPOIsFromDB();
    dispatch(fetchFavorites() as any);
    dispatch(fetchRoutesAsync() as any);
  }, [dispatch]);

  const handleMapPress = (e: any) => {
    // Verificar si las coordenadas están en lat/lng en lugar de latitude/longitude
    const lat = e.latlng?.lat || e.latlng?.latitude;
    const lng = e.latlng?.lng || e.latlng?.longitude;
    
    if (lat && lng) {
      setNewPOI({ latitude: lat, longitude: lng });
      setModalVisible(true);
    }
  };

  const handleAddPOI = async () => {
    if (!newPOI.name || !newPOI.latitude || !newPOI.longitude) {
      Alert.alert('Error', 'Por favor completa al menos el nombre del punto de interés');
      return;
    }

    setLoading(true);
    
    try {
      const poi: POI = {
        id: Date.now(),
        name: newPOI.name,
        description: newPOI.description || '',
        latitude: newPOI.latitude,
        longitude: newPOI.longitude,
        image: newPOI.image,
        categoryId: newPOI.categoryId,
      };
      
      await dispatch(addPOIAsync(poi) as any);
      setModalVisible(false);
      setNewPOI({});
      
      Alert.alert('Éxito', 'Punto de interés agregado correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo agregar el punto de interés');
      console.error('Error adding POI:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
    setNewPOI({});
  };

  const handleDismissError = () => {
    dispatch(clearError());
  };

  const handleToggleFavorite = (poiId: number) => {
    if (favoriteIds.includes(poiId)) {
      dispatch(removeFavoriteAsync(poiId) as any);
    } else {
      dispatch(addFavoriteAsync(poiId) as any);
    }
  };

  const handleDeletePOI = async (poiId: number) => {
    setPoiToDelete(poiId);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (poiToDelete === null) return;
    
    try {
      await dispatch(removePOIAsync(poiToDelete) as any);
      setDeleteModalVisible(false);
      setPoiToDelete(null);
      alert('Punto de interés eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar POI:', error);
      alert('Error: No se pudo eliminar el punto de interés');
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
    setPoiToDelete(null);
  };

  const handlePOISelect = (poi: POI) => {
    setSelectedPOI(poi);
  };

  // Función para resaltar texto de búsqueda
  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <Text key={index} style={styles.highlightedText}>{part}</Text>
      ) : part
    );
  };

  // Filtrar POIs según el estado de favoritos, categorías y búsqueda
  const filteredPOIs = pois.filter(poi => {
    // Filtro por favoritos
    if (showOnlyFavorites && !favoriteIds.includes(poi.id)) {
      return false;
    }
    
    // Filtro por categoría
    if (selectedCategory && poi.categoryId !== selectedCategory) {
      return false;
    }
    
    // Filtro por búsqueda (nombre y descripción)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const nameMatch = poi.name.toLowerCase().includes(query);
      const descriptionMatch = poi.description.toLowerCase().includes(query);
      if (!nameMatch && !descriptionMatch) {
        return false;
      }
    }
    
    return true;
  });

  // Leaflet components
  const { MapContainer, TileLayer, Marker: LeafletMarker, Popup, useMapEvents, Polyline } = require('react-leaflet');
  const L = require('leaflet');
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });

  function MapClickHandler() {
    useMapEvents({
      click: (e: any) => {
        handleMapPress(e);
      },
    });
    return null;
  }

  const defaultLat = pois[0]?.latitude || 40.4168;
  const defaultLng = pois[0]?.longitude || -3.7038;

  // Funciones para rutas
  const handleCreateRoute = () => {
    setShowRouteCreator(true);
  };

  const handleRouteCreated = () => {
    setShowRouteCreator(false);
  };

  const handleShowRoutes = () => {
    setShowRoutes(!showRoutes);
    if (selectedRoute) {
      dispatch(clearSelectedRoute());
      setRoutePath(null);
    }
  };

  // Función para limpiar la ruta del mapa
  const clearRouteFromMap = () => {
    dispatch(clearSelectedRoute());
    setRoutePath(null);
  };

  // Función para cargar la ruta en el mapa
  const loadRouteInMap = async (route: Route) => {
    setRouteLoading(true);
    try {
      // Obtener los POIs de la ruta en el orden correcto
      const routePOIs = route.poiIds
        .map(id => pois.find(poi => poi.id === id))
        .filter((poi): poi is POI => poi !== undefined);

      if (routePOIs.length < 2) {
        console.log('No hay suficientes POIs para calcular la ruta');
        return;
      }

      console.log('Calculando ruta para:', route.name);
      const path = await getCompleteRoute(routePOIs);
      
      // Convertir los puntos para Leaflet
      const leafletPath = path.segments.flatMap(segment => 
        segment.points.map(point => [point.lat, point.lng])
      );

      setRoutePath({
        coordinates: leafletPath,
        distance: path.totalDistance,
        duration: path.totalDuration,
        color: route.color
      });

      console.log('Ruta cargada en mapa:', {
        name: route.name,
        distance: formatDistance(path.totalDistance),
        duration: formatDuration(path.totalDuration)
      });

    } catch (error) {
      console.error('Error al cargar la ruta en el mapa:', error);
      setRoutePath(null);
    } finally {
      setRouteLoading(false);
    }
  };

  // Funciones para compartir
  const handleSharePOI = async (poi: POI) => {
    setItemToShare(poi);
    setShareType('poi');
    setShareModalVisible(true);
  };

  const handleShareRoute = async (route: Route) => {
    setItemToShare(route);
    setShareType('route');
    setShareModalVisible(true);
  };

  const handleShareMultiple = async () => {
    setShareType('multiple');
    setShareModalVisible(true);
  };

  const handleShare = async () => {
    try {
      if (shareType === 'poi' && itemToShare && 'latitude' in itemToShare) {
        await sharePOI(itemToShare as POI);
      } else if (shareType === 'route' && itemToShare && 'poiIds' in itemToShare) {
        await shareRoute(itemToShare as Route, pois);
      } else if (shareType === 'multiple') {
        await shareMultiplePOIs(filteredPOIs);
      }
      setShareModalVisible(false);
      setItemToShare(null);
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir el contenido');
    }
  };

  const handleExportGPX = () => {
    if (selectedRoute) {
      const routePOIs = selectedRoute.poiIds
        .map(id => pois.find(poi => poi.id === id))
        .filter((poi): poi is POI => poi !== undefined);
      exportToGPX(routePOIs, selectedRoute.name);
    } else {
      exportToGPX(filteredPOIs);
    }
  };

  const handleExportKML = () => {
    if (selectedRoute) {
      const routePOIs = selectedRoute.poiIds
        .map(id => pois.find(poi => poi.id === id))
        .filter((poi): poi is POI => poi !== undefined);
      exportToKML(routePOIs, selectedRoute.name);
    } else {
      exportToKML(filteredPOIs);
    }
  };

  return (
    <View style={styles.container}>
      {error && <ErrorMessage message={error} onDismiss={handleDismissError} />}
      
      {/* Sidebar con lista de POIs */}
      {showSidebar && (
        <View style={styles.sidebar}>
          <View style={styles.sidebarHeader}>
            <Text style={styles.sidebarTitle}>
              {showRoutes ? 'Rutas' : showOnlyFavorites ? 'Favoritos' : 'Puntos de Interés'} ({showRoutes ? routes.length : filteredPOIs.length})
              {selectedCategory && !showRoutes && (
                <Text style={styles.filterInfo}>
                  {' - '}{getCategoryById(selectedCategory)?.name}
                </Text>
              )}
              {searchQuery && !showRoutes && (
                <Text style={styles.filterInfo}>
                  {' - Buscando: "'}{searchQuery}{'"'}
                </Text>
              )}
            </Text>
            <View style={styles.headerButtons}>
              {!showRoutes && (
                <TouchableOpacity 
                  style={[styles.filterButton, showOnlyFavorites && styles.filterButtonActive]}
                  onPress={() => setShowOnlyFavorites(!showOnlyFavorites)}
                >
                  <Text style={[styles.filterButtonText, showOnlyFavorites && styles.filterButtonTextActive]}>
                    {showOnlyFavorites ? '❤️' : '🤍'}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={[styles.filterButton, showRoutes && styles.filterButtonActive]}
                onPress={handleShowRoutes}
              >
                <Text style={[styles.filterButtonText, showRoutes && styles.filterButtonTextActive]}>
                  🗺️
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.toggleButton}
                onPress={() => setShowSidebar(false)}
              >
                <Text style={styles.toggleButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Botones de acción */}
          <View style={styles.actionButtons}>
            {showRoutes ? (
              <View style={styles.routeActionButtons}>
                <TouchableOpacity 
                  style={styles.createButton}
                  onPress={handleCreateRoute}
                >
                  <Text style={styles.createButtonText}>➕ Crear Ruta</Text>
                </TouchableOpacity>
                {selectedRoute && (
                  <TouchableOpacity 
                    style={styles.clearRouteButton}
                    onPress={clearRouteFromMap}
                  >
                    <Text style={styles.clearRouteButtonText}>🗑️ Limpiar</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={styles.poiActionButtons}>
                <TouchableOpacity 
                  style={styles.shareButton}
                  onPress={handleShareMultiple}
                >
                  <Text style={styles.shareButtonText}>📤 Compartir</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.exportButton}
                  onPress={handleExportGPX}
                >
                  <Text style={styles.exportButtonText}>📁 GPX</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.exportButton}
                  onPress={handleExportKML}
                >
                  <Text style={styles.exportButtonText}>📁 KML</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          {/* Campo de búsqueda */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar POIs por nombre o descripción..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#999"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  style={styles.clearSearchButton}
                  onPress={() => setSearchQuery('')}
                >
                  <Text style={styles.clearSearchButtonText}>×</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          {/* Filtro de categorías - solo para POIs */}
          {!showRoutes && (
            <View style={styles.categoryFilter}>
              <Text style={styles.categoryFilterTitle}>Filtrar por categoría:</Text>
              <FlatList
                data={CATEGORIES}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.categoryButton,
                      selectedCategory === item.id && styles.categoryButtonActive
                    ]}
                    onPress={() => setSelectedCategory(selectedCategory === item.id ? null : item.id)}
                  >
                    <Text style={styles.categoryButtonIcon}>{item.icon}</Text>
                    <Text style={[
                      styles.categoryButtonText,
                      selectedCategory === item.id && styles.categoryButtonTextActive
                    ]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
                ListHeaderComponent={() => (
                  <TouchableOpacity
                    style={[
                      styles.categoryButton,
                      !selectedCategory && styles.categoryButtonActive
                    ]}
                    onPress={() => setSelectedCategory(null)}
                  >
                    <Text style={styles.categoryButtonIcon}>📍</Text>
                    <Text style={[
                      styles.categoryButtonText,
                      !selectedCategory && styles.categoryButtonTextActive
                    ]}>
                      Todas
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
          
          {/* Lista de POIs o Rutas */}
          <View style={styles.poiListContainer}>
            {showRoutes ? (
              <>
                {/* Información de la ruta seleccionada */}
                {selectedRoute && routePath && (
                  <View style={styles.selectedRouteInfo}>
                    <Text style={styles.selectedRouteTitle}>{selectedRoute.name}</Text>
                    {selectedRoute.description && (
                      <Text style={styles.selectedRouteDescription}>{selectedRoute.description}</Text>
                    )}
                    <View style={styles.routeStats}>
                      <Text style={styles.routeStat}>
                        📏 {formatDistance(routePath.distance)}
                      </Text>
                      <Text style={styles.routeStat}>
                        ⏱️ {formatDuration(routePath.duration)}
                      </Text>
                      <Text style={styles.routeStat}>
                        🎯 {selectedRoute.poiIds.length} puntos
                      </Text>
                    </View>
                  </View>
                )}
                
                <FlatList
                  data={routes}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => {
                    return (
                      <RouteCard 
                        route={item} 
                        onPress={() => {
                          dispatch(setSelectedRoute(item));
                          loadRouteInMap(item);
                        }}
                        onShare={() => handleShareRoute(item)}
                      />
                    );
                  }}
                  ListEmptyComponent={() => {
                    return (
                      <Text style={styles.emptyText}>
                        No hay rutas creadas. Crea una nueva ruta para empezar.
                      </Text>
                    );
                  }}
                />
              </>
            ) : (
              <FlatList
                data={filteredPOIs}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item, index }) => {
                  return (
                    <View style={styles.poiItem}>
                      <POICard poi={item} isFavorite={favoriteIds.includes(item.id)} searchQuery={searchQuery} />
                      <View style={styles.poiActions}>
                        <TouchableOpacity 
                          style={[styles.actionButton, favoriteIds.includes(item.id) && styles.favoriteButton]}
                          onPress={() => handleToggleFavorite(item.id)}
                        >
                          <Text style={[styles.actionButtonText, favoriteIds.includes(item.id) && styles.favoriteButtonText]}>
                            {favoriteIds.includes(item.id) ? '❤️' : '🤍'}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.actionButton, styles.shareButton]}
                          onPress={() => handleSharePOI(item)}
                        >
                          <Text style={styles.actionButtonText}>📤</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.actionButton, styles.deleteButton]}
                          onPress={() => handleDeletePOI(item.id)}
                        >
                          <Text style={styles.deleteButtonText}>🗑️</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                }}
                ListEmptyComponent={() => (
                  <Text style={styles.emptyText}>
                    {searchQuery 
                      ? `No se encontraron POIs que coincidan con "${searchQuery}".`
                      : showOnlyFavorites 
                        ? 'No tienes puntos de interés favoritos. Marca algunos POIs como favoritos para verlos aquí.'
                        : 'No hay puntos de interés. Toca en el mapa para agregar uno.'
                    }
                  </Text>
                )}
                extraData={pois.length}
                removeClippedSubviews={false}
                getItemLayout={(data, index) => ({
                  length: 120,
                  offset: 120 * index,
                  index,
                })}
              />
            )}
          </View>
        </View>
      )}

      {/* Botón para mostrar sidebar */}
      {!showSidebar && (
        <TouchableOpacity 
          style={styles.showSidebarButton}
          onPress={() => setShowSidebar(true)}
        >
          <Text style={styles.showSidebarButtonText}>☰</Text>
        </TouchableOpacity>
      )}

      {/* Mapa */}
      <View style={[styles.mapContainer, !showSidebar && styles.mapContainerFull]}>
        <MapContainer
          center={[defaultLat, defaultLng]}
          zoom={15}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapClickHandler />
          
          {/* Mostrar ruta seleccionada */}
          {routePath && routePath.coordinates && routePath.coordinates.length > 1 && (
            <Polyline
              positions={routePath.coordinates}
              color={routePath.color}
              weight={4}
              opacity={0.8}
            >
              <Popup>
                <div style={{ textAlign: 'center', minWidth: '200px' }}>
                  <b>{selectedRoute?.name}</b><br />
                  {selectedRoute?.description && <span>{selectedRoute.description}<br /></span>}
                  <span>Distancia: {formatDistance(routePath.distance)}</span><br />
                  <span>Duración: {formatDuration(routePath.duration)}</span>
                </div>
              </Popup>
            </Polyline>
          )}
          
          {/* Indicador de carga de ruta */}
          {routeLoading && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '5px',
              zIndex: 1000
            }}>
              Calculando ruta...
            </div>
          )}
          
          {pois.map(poi => (
            <LeafletMarker 
              key={poi.id} 
              position={[poi.latitude, poi.longitude]}
              eventHandlers={{
                click: () => handlePOISelect(poi),
              }}
            >
              <Popup>
                <div style={{ textAlign: 'center', minWidth: '200px' }}>
                  {poi.image && (
                    <img 
                      src={poi.image} 
                      alt={poi.name}
                      style={{ 
                        width: '100%', 
                        height: '120px', 
                        objectFit: 'cover',
                        borderRadius: '8px',
                        marginBottom: '8px'
                      }} 
                    />
                  )}
                  <b>{poi.name}</b><br />
                  {poi.description && <span>{poi.description}<br /></span>}
                  {poi.categoryId && <span>Categoría: {getCategoryById(poi.categoryId)?.name}</span>}
                </div>
              </Popup>
            </LeafletMarker>
          ))}
        </MapContainer>
      </View>
      
      {/* Modal para agregar POI */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nuevo Punto de Interés</Text>
            
            <TextInput 
              placeholder="Nombre *" 
              style={styles.input} 
              value={newPOI.name || ''} 
              onChangeText={t => setNewPOI({ ...newPOI, name: t })}
            />
            
            <TextInput 
              placeholder="Descripción" 
              style={styles.input} 
              value={newPOI.description || ''} 
              onChangeText={t => setNewPOI({ ...newPOI, description: t })}
              multiline
            />
            
            <Text style={styles.inputLabel}>Imagen:</Text>
            <ImagePicker
              imageUri={newPOI.image}
              onImageSelected={(uri) => setNewPOI({ ...newPOI, image: uri })}
              onImageRemoved={() => setNewPOI({ ...newPOI, image: undefined })}
            />
            
            <Text style={styles.coords}>
              Lat: {newPOI.latitude?.toFixed(6)}, Lon: {newPOI.longitude?.toFixed(6)}
            </Text>
            
            <Text style={styles.inputLabel}>Categoría:</Text>
            <View style={styles.categorySelector}>
              <FlatList
                data={CATEGORIES}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.modalCategoryButton,
                      newPOI.categoryId === item.id && styles.modalCategoryButtonActive
                    ]}
                    onPress={() => setNewPOI({ ...newPOI, categoryId: item.id })}
                  >
                    <Text style={styles.modalCategoryButtonIcon}>{item.icon}</Text>
                    <Text style={[
                      styles.modalCategoryButtonText,
                      newPOI.categoryId === item.id && styles.modalCategoryButtonTextActive
                    ]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
            
            <View style={styles.modalBtns}>
              <Button 
                title="Cancelar" 
                onPress={handleCancel}
                disabled={loading}
              />
              <Button 
                title={loading ? "Guardando..." : "Guardar"} 
                onPress={handleAddPOI}
                disabled={loading}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal visible={deleteModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar Eliminación</Text>
            <Text style={styles.modalText}>
              ¿Estás seguro de que quieres eliminar este punto de interés?
            </Text>
            <Text style={styles.modalText}>
              Esta acción no se puede deshacer.
            </Text>
            
            <View style={styles.modalBtns}>
              <Button 
                title="Cancelar" 
                onPress={handleCancelDelete}
              />
              <Button 
                title="Eliminar" 
                onPress={handleConfirmDelete}
                color="#ff4444"
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para crear rutas */}
      <Modal visible={showRouteCreator} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { width: '95%', maxWidth: 600, height: '90%' }]}>
            <RouteCreator onClose={handleRouteCreated} />
          </View>
        </View>
      </Modal>

      {/* Modal para compartir */}
      <Modal visible={shareModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {shareType === 'poi' ? 'Compartir POI' : 
               shareType === 'route' ? 'Compartir Ruta' : 
               'Compartir Colección'}
            </Text>
            <Text style={styles.modalText}>
              {shareType === 'poi' && itemToShare && 'latitude' in itemToShare
                ? `¿Quieres compartir "${itemToShare.name}"?`
                : shareType === 'route' && itemToShare && 'poiIds' in itemToShare
                ? `¿Quieres compartir la ruta "${itemToShare.name}"?`
                : `¿Quieres compartir ${filteredPOIs.length} puntos de interés?`
              }
            </Text>
            
            <View style={styles.modalBtns}>
              <Button 
                title="Cancelar" 
                onPress={() => {
                  setShareModalVisible(false);
                  setItemToShare(null);
                }}
              />
              <Button 
                title="Compartir" 
                onPress={handleShare}
                color="#007AFF"
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 350,
    backgroundColor: '#f5f5f5',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleButton: {
    padding: 5,
  },
  toggleButtonText: {
    fontSize: 20,
    color: '#666',
  },
  poiItem: {
    margin: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  poiActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    padding: 8,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
  },
  actionButtonText: {
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
  deleteButtonText: {
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    margin: 20,
  },
  showSidebarButton: {
    position: 'absolute',
    top: 50,
    left: 10,
    zIndex: 1000,
    backgroundColor: '#fff',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  showSidebarButtonText: {
    fontSize: 20,
  },
  mapContainer: {
    flex: 1,
  },
  mapContainerFull: {
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  coords: {
    color: '#666',
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalBtns: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  poiListContainer: {
    flex: 1,
    padding: 10,
  },
  debugText: {
    color: '#666',
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
  },
  poiName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  poiDesc: {
    color: '#666',
    marginBottom: 5,
  },
  poiCoords: {
    color: '#999',
    fontSize: 12,
    marginBottom: 5,
  },
  modalText: {
    color: '#666',
    fontSize: 16,
    marginBottom: 10,
  },
  favoriteButton: {
    backgroundColor: '#ffe0e0',
    borderColor: '#ff6b6b',
  },
  favoriteButtonText: {
    color: '#ff6b6b',
  },
  filterButton: {
    padding: 8,
    borderRadius: 5,
    marginRight: 5,
  },
  filterButtonActive: {
    backgroundColor: '#ffe0e0',
    borderWidth: 1,
    borderColor: '#ff6b6b',
  },
  filterButtonText: {
    fontSize: 16,
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#ff6b6b',
  },
  categoryFilter: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  categoryFilterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  categoryButton: {
    padding: 8,
    borderRadius: 5,
    marginRight: 5,
  },
  categoryButtonActive: {
    backgroundColor: '#ffe0e0',
    borderWidth: 1,
    borderColor: '#ff6b6b',
  },
  categoryButtonIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  categoryButtonText: {
    fontSize: 16,
    color: '#666',
  },
  categoryButtonTextActive: {
    color: '#ff6b6b',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  categorySelector: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
  },
  modalCategoryButton: {
    padding: 8,
    borderRadius: 5,
    marginRight: 5,
  },
  modalCategoryButtonActive: {
    backgroundColor: '#ffe0e0',
    borderWidth: 1,
    borderColor: '#ff6b6b',
  },
  modalCategoryButtonIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  modalCategoryButtonText: {
    fontSize: 16,
    color: '#666',
  },
  modalCategoryButtonTextActive: {
    color: '#ff6b6b',
  },
  filterInfo: {
    color: '#999',
    fontSize: 12,
  },
  searchContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  clearSearchButton: {
    padding: 8,
    borderRadius: 5,
    marginLeft: 10,
  },
  clearSearchButtonText: {
    fontSize: 16,
    color: '#666',
  },
  highlightedText: {
    backgroundColor: '#ffd700',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  createButton: {
    padding: 8,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
  },
  createButtonText: {
    fontSize: 16,
  },
  poiActionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareButton: {
    padding: 8,
    borderRadius: 5,
    marginRight: 5,
  },
  shareButtonText: {
    fontSize: 16,
  },
  exportButton: {
    padding: 8,
    borderRadius: 5,
    marginRight: 5,
  },
  exportButtonText: {
    fontSize: 16,
  },
  routeActionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearRouteButton: {
    padding: 8,
    borderRadius: 5,
    marginLeft: 10,
  },
  clearRouteButtonText: {
    fontSize: 16,
    color: '#666',
  },
  selectedRouteInfo: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  selectedRouteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  selectedRouteDescription: {
    color: '#666',
    marginBottom: 5,
  },
  routeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  routeStat: {
    fontSize: 16,
  },
});

export default MainMapScreen; 
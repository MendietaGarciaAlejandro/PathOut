import React, { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { POI } from '../types/poi';
import db from '../services/dbService';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { setPOIs, addPOIAsync } from '../redux/slices/poiSlice';

const MapScreen = () => {
    const dispatch = useDispatch();
    const pois = useSelector((state: RootState) => state.poi.pois);
    const [modalVisible, setModalVisible] = useState(false);
    const [newPOI, setNewPOI] = useState<Partial<POI>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadPOIs();
    }, []);

    const loadPOIs = () => {
        db.transaction((tx: any) => {
            tx.executeSql(
                'SELECT * FROM pois',
                [],
                (_: any, { rows }: any) => {
                    dispatch(setPOIs(rows._array || []));
                }
            );
        });
    };

    const { MapContainer, TileLayer, Marker: LeafletMarker, Popup, useMapEvents } = require('react-leaflet');
    const L = require('leaflet');
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });

    function MapClickHandler() {
        useMapEvents({
            click(e: any) {
                setNewPOI({ latitude: e.latlng.lat, longitude: e.latlng.lng });
                setModalVisible(true);
            },
        });
        return null;
    }

    const handleAddPOI = async () => {
        if (!newPOI.name || !newPOI.latitude || !newPOI.longitude) {
            alert('Por favor completa al menos el nombre del punto de interés');
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
                category: newPOI.category,
            };
            
            await dispatch(addPOIAsync(poi) as any);
            setModalVisible(false);
            setNewPOI({});
            
            // Recargar POIs después de un breve delay
            setTimeout(() => {
                loadPOIs();
            }, 100);
            
            alert('Punto de interés agregado correctamente');
        } catch (error) {
            alert('No se pudo agregar el punto de interés');
            console.error('Error adding POI:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setModalVisible(false);
        setNewPOI({});
    };

    // Si no hay POIs en web, usar coordenadas por defecto
    const defaultLat = pois[0]?.latitude || 40.4168;
    const defaultLng = pois[0]?.longitude || -3.7038;

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
            <MapContainer
                center={[defaultLat, defaultLng]}
                zoom={15}
                style={{ width: '100%', height: '100%' }}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapClickHandler />
                {pois.map(poi => (
                    <LeafletMarker key={poi.id} position={[poi.latitude, poi.longitude]}>
                        <Popup>
                            <b>{poi.name}</b><br />
                            {poi.description && <span>{poi.description}<br /></span>}
                            {poi.category && <span>Categoría: {poi.category}</span>}
                        </Popup>
                    </LeafletMarker>
                ))}
            </MapContainer>
            
            {modalVisible && (
                <div style={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)', 
                    background: '#fff', 
                    padding: '24px', 
                    borderRadius: '8px', 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)', 
                    zIndex: 1000,
                    minWidth: '300px',
                    maxWidth: '400px'
                }}>
                    <h3 style={{ margin: '0 0 20px 0', textAlign: 'center' }}>Nuevo Punto de Interés</h3>
                    
                    <input 
                        placeholder="Nombre *" 
                        style={{ 
                            display: 'block', 
                            marginBottom: '10px', 
                            width: '100%', 
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            fontSize: '16px'
                        }} 
                        value={newPOI.name || ''} 
                        onChange={e => setNewPOI({ ...newPOI, name: e.target.value })} 
                    />
                    
                    <textarea 
                        placeholder="Descripción" 
                        style={{ 
                            display: 'block', 
                            marginBottom: '10px', 
                            width: '100%', 
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            fontSize: '16px',
                            minHeight: '80px',
                            resize: 'vertical'
                        }} 
                        value={newPOI.description || ''} 
                        onChange={e => setNewPOI({ ...newPOI, description: e.target.value })} 
                    />
                    
                    <div style={{ 
                        color: '#666', 
                        marginBottom: '10px', 
                        fontSize: '12px',
                        textAlign: 'center'
                    }}>
                        Lat: {newPOI.latitude?.toFixed(6)}, Lon: {newPOI.longitude?.toFixed(6)}
                    </div>
                    
                    <input 
                        placeholder="Categoría" 
                        style={{ 
                            display: 'block', 
                            marginBottom: '20px', 
                            width: '100%', 
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            fontSize: '16px'
                        }} 
                        value={newPOI.category || ''} 
                        onChange={e => setNewPOI({ ...newPOI, category: e.target.value })} 
                    />
                    
                    <div style={{ display: 'flex', justifyContent: 'space-around', gap: '10px' }}>
                        <button 
                            onClick={handleCancel}
                            disabled={loading}
                            style={{
                                padding: '10px 20px',
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                background: '#f5f5f5',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.6 : 1
                            }}
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={handleAddPOI}
                            disabled={loading}
                            style={{
                                padding: '10px 20px',
                                border: 'none',
                                borderRadius: '5px',
                                background: '#007AFF',
                                color: 'white',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.6 : 1
                            }}
                        >
                            {loading ? "Guardando..." : "Guardar"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapScreen;

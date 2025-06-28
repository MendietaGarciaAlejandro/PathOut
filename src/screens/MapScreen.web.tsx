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

    useEffect(() => {
        db.transaction((tx: any) => {
            tx.executeSql(
                'SELECT * FROM pois',
                [],
                (_: any, { rows }: any) => {
                    dispatch(setPOIs(rows._array || []));
                }
            );
        });
    }, [dispatch]);

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

    const handleAddPOI = () => {
        if (!newPOI.name || !newPOI.latitude || !newPOI.longitude) return;
        const poi: POI = {
            id: Date.now(),
            name: newPOI.name,
            description: newPOI.description || '',
            latitude: newPOI.latitude,
            longitude: newPOI.longitude,
            image: newPOI.image,
            category: newPOI.category,
        };
        dispatch(addPOIAsync(poi) as any);
        setModalVisible(false);
        setNewPOI({});
    };

    // Si no hay POIs en web, usar dummy
    const poisToShow = pois.length > 0 ? pois : [
        { id: 1, name: 'Catedral', description: 'La catedral principal de la ciudad.', latitude: 40.4168, longitude: -3.7038 },
        { id: 2, name: 'Museo de Arte', description: 'Museo con exposiciones locales.', latitude: 40.417, longitude: -3.704 },
    ];

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
            <MapContainer
                center={[poisToShow[0]?.latitude || 40.4168, poisToShow[0]?.longitude || -3.7038]}
                zoom={15}
                style={{ width: '100%', height: '100%' }}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapClickHandler />
                {poisToShow.map(poi => (
                    <LeafletMarker key={poi.id} position={[poi.latitude, poi.longitude]}>
                        <Popup>
                            <b>{poi.name}</b><br />{poi.description}
                        </Popup>
                    </LeafletMarker>
                ))}
            </MapContainer>
            {modalVisible && (
                <div style={{ position: 'absolute', top: 40, left: '50%', transform: 'translateX(-50%)', background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px #0002', zIndex: 1000 }}>
                    <h3>Nuevo Punto de Interés</h3>
                    <input placeholder="Nombre" style={{ display: 'block', marginBottom: 8, width: 200 }} value={newPOI.name || ''} onChange={e => setNewPOI({ ...newPOI, name: e.target.value })} />
                    <input placeholder="Descripción" style={{ display: 'block', marginBottom: 8, width: 200 }} value={newPOI.description || ''} onChange={e => setNewPOI({ ...newPOI, description: e.target.value })} />
                    <div style={{ color: '#888', marginBottom: 8 }}>Lat: {newPOI.latitude}, Lon: {newPOI.longitude}</div>
                    <input placeholder="Categoría" style={{ display: 'block', marginBottom: 8, width: 200 }} value={newPOI.category || ''} onChange={e => setNewPOI({ ...newPOI, category: e.target.value })} />
                    <button onClick={() => setModalVisible(false)} style={{ marginRight: 8 }}>Cancelar</button>
                    <button onClick={handleAddPOI}>Guardar</button>
                </div>
            )}
        </div>
    );
};

export default MapScreen;

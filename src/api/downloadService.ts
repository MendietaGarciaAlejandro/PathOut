import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import db from '../services/dbService';
import { POI } from '../types/poi';

export const downloadPOIs = async (url: string) => {
  const response = await FileSystem.downloadAsync(url, FileSystem.documentDirectory + 'pois.json');
  const data = await FileSystem.readAsStringAsync(response.uri);
  const pois: POI[] = JSON.parse(data);
  await savePOIsToDB(pois);
  return pois;
};

const savePOIsToDB = async (pois: POI[]) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx: any) => {
      pois.forEach(poi => {
        tx.executeSql(
          'INSERT OR REPLACE INTO pois (id, name, description, latitude, longitude, image, categoryId) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [poi.id, poi.name, poi.description, poi.latitude, poi.longitude, poi.image, poi.categoryId]
        );
      });
    }, reject, resolve);
  });
};

import * as SQLite from 'expo-sqlite';
import { POI } from '../types/poi';

const db = (SQLite as any).openDatabase('pathout.db');

// Crear tabla de favoritos
export const initDB = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx: any) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS pois (
          id INTEGER PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          latitude REAL,
          longitude REAL,
          image TEXT,
          categoryId TEXT
        );`,
        [],
        () => {
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS favorites (
              poi_id INTEGER PRIMARY KEY NOT NULL
            );`,
            [],
            () => resolve(true),
            (_: any, err: any) => { 
              console.error('Error creating favorites table:', err);
              reject(err); 
              return false; 
            }
          );
        },
        (_: any, err: any) => { 
          console.error('Error creating pois table:', err);
          reject(err); 
          return false; 
        }
      );
    });
  });
};

export const addFavorite = (poiId: number) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx: any) => {
      tx.executeSql(
        'INSERT OR REPLACE INTO favorites (poi_id) VALUES (?)', 
        [poiId], 
        () => resolve(true),
        (_: any, err: any) => {
          console.error('Error adding favorite:', err);
          reject(err);
          return false;
        }
      );
    });
  });
};

export const removeFavorite = (poiId: number) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx: any) => {
      tx.executeSql(
        'DELETE FROM favorites WHERE poi_id = ?', 
        [poiId], 
        () => resolve(true),
        (_: any, err: any) => {
          console.error('Error removing favorite:', err);
          reject(err);
          return false;
        }
      );
    });
  });
};

export const getFavorites = () => {
  return new Promise<number[]>((resolve, reject) => {
    db.transaction((tx: any) => {
      tx.executeSql(
        'SELECT poi_id FROM favorites', 
        [], 
        (_: any, { rows }: any) => {
          resolve(rows._array.map((row: any) => row.poi_id));
        }, 
        (_: any, err: any) => {
          console.error('Error getting favorites:', err);
          reject(err);
          return false;
        }
      );
    });
  });
};

export const insertPOI = (poi: POI) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx: any) => {
      tx.executeSql(
        'INSERT OR REPLACE INTO pois (id, name, description, latitude, longitude, image, categoryId) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [poi.id, poi.name, poi.description, poi.latitude, poi.longitude, poi.image, poi.categoryId],
        () => resolve(true),
        (_: any, err: any) => {
          console.error('Error inserting POI:', err);
          reject(err);
          return false;
        }
      );
    });
  });
};

export const deletePOI = (poiId: number) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx: any) => {
      tx.executeSql(
        'DELETE FROM pois WHERE id = ?', 
        [poiId], 
        () => {
          tx.executeSql(
            'DELETE FROM favorites WHERE poi_id = ?', 
            [poiId],
            () => resolve(true),
            (_: any, err: any) => {
              console.error('Error removing POI from favorites:', err);
              // No rechazamos aquí porque el POI principal ya se eliminó
            }
          );
        },
        (_: any, err: any) => {
          console.error('Error deleting POI:', err);
          reject(err);
          return false;
        }
      );
    });
  });
};

export default db;

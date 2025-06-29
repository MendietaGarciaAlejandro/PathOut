// Implementación de dbService para web usando localStorage para persistencia

interface POI {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  image?: string;
  category?: string;
}

interface Favorite {
  poi_id: number;
}

class WebDatabase {
  private pois: POI[] = [];
  private favorites: number[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const poisData = localStorage.getItem('pathout_pois');
      const favoritesData = localStorage.getItem('pathout_favorites');
      
      if (poisData) {
        this.pois = JSON.parse(poisData);
      }
      
      if (favoritesData) {
        this.favorites = JSON.parse(favoritesData);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('pathout_pois', JSON.stringify(this.pois));
      localStorage.setItem('pathout_favorites', JSON.stringify(this.favorites));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  transaction(callback: (tx: any) => void) {
    const tx = {
      executeSql: (sql: string, params: any[], success?: any, error?: any) => {
        try {
          if (sql.includes('CREATE TABLE')) {
            // Las tablas ya están "creadas" en memoria
            if (success) success();
          } else if (sql.includes('SELECT * FROM pois')) {
            if (success) {
              success(null, { rows: { _array: this.pois } });
            }
          } else if (sql.includes('SELECT poi_id FROM favorites')) {
            if (success) success(null, { rows: { _array: this.favorites.map(id => ({ poi_id: id })) } });
          } else if (sql.includes('INSERT OR REPLACE INTO pois')) {
            const poi: POI = {
              id: params[0],
              name: params[1],
              description: params[2],
              latitude: params[3],
              longitude: params[4],
              image: params[5],
              category: params[6],
            };
            
            const existingIndex = this.pois.findIndex(p => p.id === poi.id);
            if (existingIndex >= 0) {
              this.pois = [...this.pois.slice(0, existingIndex), poi, ...this.pois.slice(existingIndex + 1)];
            } else {
              this.pois = [...this.pois, poi];
            }
            this.saveToStorage();
            if (success) success();
          } else if (sql.includes('INSERT OR REPLACE INTO favorites')) {
            const poiId = params[0];
            if (!this.favorites.includes(poiId)) {
              this.favorites = [...this.favorites, poiId];
              this.saveToStorage();
            }
            if (success) success();
          } else if (sql.includes('DELETE FROM pois')) {
            const poiId = params[0];
            this.pois = this.pois.filter(p => p.id !== poiId);
            this.saveToStorage();
            if (success) success();
          } else if (sql.includes('DELETE FROM favorites')) {
            const poiId = params[0];
            this.favorites = this.favorites.filter(id => id !== poiId);
            this.saveToStorage();
            if (success) success();
          }
        } catch (err) {
          if (error) error(null, err);
        }
      }
    };
    
    callback(tx);
  }
}

const db = new WebDatabase();

export const initDB = () => {
  return new Promise((resolve) => {
    // La base de datos ya está inicializada en el constructor
    resolve(true);
  });
};

export const addFavorite = (poiId: number) => {
  return new Promise((resolve, reject) => {
    try {
      db.transaction((tx: any) => {
        tx.executeSql(
          'INSERT OR REPLACE INTO favorites (poi_id) VALUES (?)',
          [poiId],
          () => resolve(true),
          (_: any, err: any) => reject(err)
        );
      });
    } catch (error) {
      reject(error);
    }
  });
};

export const removeFavorite = (poiId: number) => {
  return new Promise((resolve, reject) => {
    try {
      db.transaction((tx: any) => {
        tx.executeSql(
          'DELETE FROM favorites WHERE poi_id = ?',
          [poiId],
          () => resolve(true),
          (_: any, err: any) => reject(err)
        );
      });
    } catch (error) {
      reject(error);
    }
  });
};

export const getFavorites = () => {
  return new Promise<number[]>((resolve, reject) => {
    try {
      db.transaction((tx: any) => {
        tx.executeSql(
          'SELECT poi_id FROM favorites',
          [],
          (_: any, { rows }: any) => {
            resolve(rows._array.map((row: any) => row.poi_id));
          },
          (_: any, err: any) => reject(err)
        );
      });
    } catch (error) {
      reject(error);
    }
  });
};

export const insertPOI = (poi: POI) => {
  return new Promise((resolve, reject) => {
    try {
      db.transaction((tx: any) => {
        tx.executeSql(
          'INSERT OR REPLACE INTO pois (id, name, description, latitude, longitude, image, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [poi.id, poi.name, poi.description, poi.latitude, poi.longitude, poi.image, poi.category],
          () => {
            resolve(true);
          },
          (_: any, err: any) => {
            console.error('Error al insertar POI:', err);
            reject(err);
          }
        );
      });
    } catch (error) {
      console.error('Error en insertPOI:', error);
      reject(error);
    }
  });
};

export const deletePOI = (poiId: number) => {
  return new Promise((resolve, reject) => {
    try {
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
          (_: any, err: any) => reject(err)
        );
      });
    } catch (error) {
      reject(error);
    }
  });
};

export const getPOIs = () => {
  return new Promise<POI[]>((resolve, reject) => {
    try {
      db.transaction((tx: any) => {
        tx.executeSql(
          'SELECT * FROM pois',
          [],
          (_: any, { rows }: any) => {
            resolve(rows._array);
          },
          (_: any, err: any) => {
            console.error('Error al obtener POIs:', err);
            reject(err);
          }
        );
      });
    } catch (error) {
      console.error('Error en getPOIs:', error);
      reject(error);
    }
  });
};

export default db;

// Implementación de dbService para web usando localStorage para persistencia

interface POI {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  image?: string;
  categoryId?: string;
}

interface Favorite {
  poi_id: number;
}

interface Route {
  id: number;
  name: string;
  description?: string;
  poiIds: number[];
  createdAt: number;
  isPublic: boolean;
  color: string;
}

class WebDatabase {
  private pois: POI[] = [];
  private favorites: number[] = [];
  private routes: Route[] = [];

  constructor() {
    this.loadFromStorage();
  }

  // Método público para reinicializar la base de datos
  public reset() {
    this.pois = [];
    this.favorites = [];
    this.routes = [];
    this.saveToStorage();
  } 

  private loadFromStorage() {
    try {
      const poisData = localStorage.getItem('pathout_pois');
      const favoritesData = localStorage.getItem('pathout_favorites');
      const routesData = localStorage.getItem('pathout_routes');
      
      console.log('📂 WebDatabase: Cargando datos del storage...');
      console.log('📂 WebDatabase: POIs data:', poisData ? 'existe' : 'no existe');
      console.log('📂 WebDatabase: Favorites data:', favoritesData ? 'existe' : 'no existe');
      console.log('📂 WebDatabase: Routes data:', routesData ? 'existe' : 'no existe');
      
      if (poisData) {
        try {
          this.pois = JSON.parse(poisData);
          console.log('📂 WebDatabase: POIs cargados:', this.pois.length);
        } catch (error) {
          console.error('❌ WebDatabase: Error parsing POIs JSON, limpiando datos corruptos');
          localStorage.removeItem('pathout_pois');
          this.pois = [];
        }
      }
      
      if (favoritesData) {
        try {
          this.favorites = JSON.parse(favoritesData);
          console.log('📂 WebDatabase: Favorites cargados:', this.favorites.length);
        } catch (error) {
          console.error('❌ WebDatabase: Error parsing Favorites JSON, limpiando datos corruptos');
          localStorage.removeItem('pathout_favorites');
          this.favorites = [];
        }
      }

      if (routesData) {
        try {
          this.routes = JSON.parse(routesData);
          console.log('📂 WebDatabase: Routes cargadas:', this.routes.length);
          console.log('📂 WebDatabase: Routes:', this.routes);
        } catch (error) {
          console.error('❌ WebDatabase: Error parsing Routes JSON, limpiando datos corruptos');
          localStorage.removeItem('pathout_routes');
          this.routes = [];
        }
      }
    } catch (error) {
      console.error('❌ WebDatabase: Error loading from localStorage:', error);
      // Limpiar todo el localStorage si hay error general
      localStorage.removeItem('pathout_pois');
      localStorage.removeItem('pathout_favorites');
      localStorage.removeItem('pathout_routes');
      this.pois = [];
      this.favorites = [];
      this.routes = [];
    }
  }

  private saveToStorage() {
    try {
      console.log('💾 WebDatabase: Guardando en storage...');
      console.log('💾 WebDatabase: POIs a guardar:', this.pois.length);
      console.log('💾 WebDatabase: Favorites a guardar:', this.favorites.length);
      console.log('💾 WebDatabase: Routes a guardar:', this.routes.length);
      
      localStorage.setItem('pathout_pois', JSON.stringify(this.pois));
      localStorage.setItem('pathout_favorites', JSON.stringify(this.favorites));
      localStorage.setItem('pathout_routes', JSON.stringify(this.routes));
      
      console.log('✅ WebDatabase: Storage guardado exitosamente');
    } catch (error) {
      console.error('❌ WebDatabase: Error saving to localStorage:', error);
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
          } else if (sql.includes('SELECT * FROM routes')) {
            if (success) {
              success(null, { rows: { _array: this.routes } });
            }
          } else if (sql.includes('INSERT OR REPLACE INTO pois')) {
            const poi: POI = {
              id: params[0],
              name: params[1],
              description: params[2],
              latitude: params[3],
              longitude: params[4],
              image: params[5],
              categoryId: params[6],
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
          } else if (sql.includes('INSERT OR REPLACE INTO routes')) {
            console.log('💾 WebDatabase: Procesando INSERT OR REPLACE INTO routes');
            const route: Route = {
              id: params[0],
              name: params[1],
              description: params[2],
              poiIds: JSON.parse(params[3]),
              createdAt: params[4],
              isPublic: Boolean(params[5]),
              color: params[6],
            };
            
            console.log('💾 WebDatabase: Ruta parseada:', route);
            console.log('💾 WebDatabase: Rutas antes de agregar:', this.routes.length);
            
            const existingIndex = this.routes.findIndex(r => r.id === route.id);
            if (existingIndex >= 0) {
              this.routes = [...this.routes.slice(0, existingIndex), route, ...this.routes.slice(existingIndex + 1)];
              console.log('💾 WebDatabase: Ruta actualizada en índice:', existingIndex);
            } else {
              this.routes = [...this.routes, route];
              console.log('💾 WebDatabase: Nueva ruta agregada');
            }
            
            console.log('💾 WebDatabase: Rutas después de agregar:', this.routes.length);
            this.saveToStorage();
            console.log('💾 WebDatabase: Storage actualizado');
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
          } else if (sql.includes('DELETE FROM routes')) {
            console.log('🗑️ WebDatabase: Procesando DELETE FROM routes');
            const routeId = params[0];
            console.log('🗑️ WebDatabase: Ruta a eliminar ID:', routeId);
            console.log('🗑️ WebDatabase: Rutas antes de eliminar:', this.routes.length);
            this.routes = this.routes.filter(r => r.id !== routeId);
            console.log('🗑️ WebDatabase: Rutas después de eliminar:', this.routes.length);
            this.saveToStorage();
            console.log('🗑️ WebDatabase: Storage actualizado después de eliminar');
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
          'INSERT OR REPLACE INTO pois (id, name, description, latitude, longitude, image, categoryId) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [poi.id, poi.name, poi.description, poi.latitude, poi.longitude, poi.image, poi.categoryId],
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

// Funciones para rutas
export const saveRoute = (route: any) => {
  console.log('💾 saveRoute: Iniciando guardado de ruta:', route);
  return new Promise((resolve, reject) => {
    try {
      db.transaction((tx: any) => {
        tx.executeSql(
          'INSERT OR REPLACE INTO routes (id, name, description, poiIds, createdAt, isPublic, color) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [route.id, route.name, route.description, JSON.stringify(route.poiIds), route.createdAt, route.isPublic ? 1 : 0, route.color],
          () => {
            console.log('✅ saveRoute: Ruta guardada exitosamente en DB');
            resolve(true);
          },
          (_: any, err: any) => {
            console.error('❌ saveRoute: Error al guardar ruta:', err);
            reject(err);
          }
        );
      });
    } catch (error) {
      console.error('❌ saveRoute: Error en transacción:', error);
      reject(error);
    }
  });
};

export const getRoutes = () => {
  console.log('📂 getRoutes: Iniciando carga de rutas');
  return new Promise<any[]>((resolve, reject) => {
    try {
      db.transaction((tx: any) => {
        tx.executeSql(
          'SELECT * FROM routes',
          [],
          (_: any, { rows }: any) => {
            try {
              const routes = rows._array.map((route: any) => {
                try {
                  return {
                    ...route,
                    poiIds: JSON.parse(route.poiIds),
                    isPublic: Boolean(route.isPublic)
                  };
                } catch (parseError) {
                  console.error('❌ getRoutes: Error parsing route.poiIds for route:', route.id, parseError);
                  // Retornar ruta con poiIds vacío si hay error
                  return {
                    ...route,
                    poiIds: [],
                    isPublic: Boolean(route.isPublic)
                  };
                }
              });
              console.log('✅ getRoutes: Rutas cargadas de DB:', routes.length, routes);
              resolve(routes);
            } catch (error) {
              console.error('❌ getRoutes: Error processing routes:', error);
              resolve([]); // Retornar array vacío en lugar de rechazar
            }
          },
          (_: any, err: any) => {
            console.error('❌ getRoutes: Error al obtener rutas:', err);
            resolve([]); // Retornar array vacío en lugar de rechazar
          }
        );
      });
    } catch (error) {
      console.error('❌ getRoutes: Error en transacción:', error);
      resolve([]); // Retornar array vacío en lugar de rechazar
    }
  });
};

export const deleteRoute = (routeId: number) => {
  console.log('🗑️ deleteRoute: Iniciando eliminación de ruta ID:', routeId);
  return new Promise((resolve, reject) => {
    try {
      db.transaction((tx: any) => {
        tx.executeSql(
          'DELETE FROM routes WHERE id = ?',
          [routeId],
          () => {
            console.log('✅ deleteRoute: Ruta eliminada exitosamente de DB');
            resolve(true);
          },
          (_: any, err: any) => {
            console.error('❌ deleteRoute: Error al eliminar ruta:', err);
            reject(err);
          }
        );
      });
    } catch (error) {
      console.error('❌ deleteRoute: Error en transacción:', error);
      reject(error);
    }
  });
};

// Función para limpiar completamente el localStorage
export const clearAllData = () => {
  console.log('🧹 clearAllData: Limpiando todo el localStorage');
  try {
    localStorage.removeItem('pathout_pois');
    localStorage.removeItem('pathout_favorites');
    localStorage.removeItem('pathout_routes');
    console.log('✅ clearAllData: localStorage limpiado exitosamente');
    
    // Reinicializar la base de datos
    db.reset();
    
    return true;
  } catch (error) {
    console.error('❌ clearAllData: Error limpiando localStorage:', error);
    return false;
  }
};

export default db;

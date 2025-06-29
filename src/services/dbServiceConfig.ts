import { Platform } from 'react-native';

// Importar el servicio de base de datos correcto según la plataforma
let dbService: any;

console.log('dbServiceConfig: Platform.OS =', Platform.OS);

if (Platform.OS === 'web') {
  // En web, usar la implementación de localStorage
  console.log('dbServiceConfig: Importando dbService.web');
  dbService = require('./dbService.web');
} else {
  // En móvil, usar SQLite
  console.log('dbServiceConfig: Importando dbService');
  dbService = require('./dbService');
}

console.log('dbServiceConfig: dbService importado:', dbService);

export const initDB = dbService.initDB;
export const addFavorite = dbService.addFavorite;
export const removeFavorite = dbService.removeFavorite;
export const getFavorites = dbService.getFavorites;
export const insertPOI = dbService.insertPOI;
export const deletePOI = dbService.deletePOI;
export default dbService.default; 
// Mock de dbService para web: simula la API de expo-sqlite pero no hace nada real

const db = {
  transaction: (callback: any) => {
    // Simula una tabla vacía
    callback({
      executeSql: (_sql: string, _params: any[], success: any) => {
        // Devuelve un array vacío
        success(null, { rows: { _array: [] } });
      },
    });
  },
};

export const initDB = () => Promise.resolve(true);
export default db;

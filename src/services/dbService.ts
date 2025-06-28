import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('pathout.db');

export const initDB = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS pois (
          id INTEGER PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          latitude REAL,
          longitude REAL,
          image TEXT,
          category TEXT
        );`,
        [],
        () => resolve(true),
        (_, err) => { reject(err); return false; }
      );
    });
  });
};

export default db;

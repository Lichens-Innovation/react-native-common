import * as SQLite from 'expo-sqlite';
export declare const getSQLiteVersion: () => Promise<string>;
export declare const createDbFolderUri: () => Promise<void>;
export declare const getUniqueDbFilename: (prefix?: string) => string;
interface DbInstance {
    db: SQLite.SQLiteDatabase;
    dbFilename: string;
}
export declare const createDbInstance: (existingFilename?: string) => Promise<DbInstance>;
export {};

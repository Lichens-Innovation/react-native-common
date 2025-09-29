import * as SQLite from 'expo-sqlite';
import { logger } from '../logger/logger';
import { nowAsDateTimeForFilename } from './date.utils';
import { getErrorMessage } from './errors.utils';
import { createDirectoryStructure, getDocumentFullFilename, isFileExists } from './file.utils';

interface SQLiteVersionResult {
  version: string;
}

export const getSQLiteVersion = async (): Promise<string> => {
  try {
    const db = await SQLite.openDatabaseAsync(':memory:');
    const result = await db.getFirstAsync<SQLiteVersionResult>('SELECT sqlite_version() as version');
    await db.closeAsync();

    return result?.version ?? 'Unknown';
  } catch (e: unknown) {
    const message = getErrorMessage(e);
    logger.error(`[getSQLiteVersion] ${message}`, e);
    throw new Error(`[getSQLiteVersion] ${message}`);
  }
};

export const createDbFolderUri = async (): Promise<void> => {
  const dbFolderUri = getDocumentFullFilename('SQLite');
  const exists = await isFileExists(dbFolderUri);
  if (!exists) {
    await createDirectoryStructure(dbFolderUri);
  }
};

export const getUniqueDbFilename = (prefix: string = ''): string => {
  const nowAsFilename = nowAsDateTimeForFilename();
  return `${prefix}${nowAsFilename}.db`;
};

interface DbInstance {
  db: SQLite.SQLiteDatabase;
  dbFilename: string;
}

export const createDbInstance = async (existingFilename?: string): Promise<DbInstance> => {
  await createDbFolderUri();

  const dbFilename = existingFilename ?? getUniqueDbFilename();
  const db = await SQLite.openDatabaseAsync(dbFilename);

  return { db, dbFilename };
};

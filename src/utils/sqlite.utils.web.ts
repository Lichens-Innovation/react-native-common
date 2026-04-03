import { nowAsDateTimeForFilename } from '@lichens-innovation/ts-common';

import { notImplementedYet } from './platform.utils';

interface DbInstance {
  db: unknown;
  dbFilename: string;
}

export const getSQLiteVersion = async (): Promise<string> => {
  notImplementedYet('[SQLite] getSQLiteVersion — SQLite is not available on web');
  throw new Error('[SQLite] getSQLiteVersion — not available on web');
};

export const createDbFolderUri = async (): Promise<void> => {
  notImplementedYet('[SQLite] createDbFolderUri — app document SQLite folder is not used on web');
};

export const getUniqueDbFilename = (prefix: string = ''): string => {
  const nowAsFilename = nowAsDateTimeForFilename();
  return `${prefix}${nowAsFilename}.db`;
};

export const createDbInstance = async (existingFilename?: string): Promise<DbInstance> => {
  notImplementedYet(
    '[SQLite] createDbInstance — local SQLite database (expo-sqlite) is not implemented on web',
    existingFilename
  );
  throw new Error('[SQLite] createDbInstance — not available on web');
};

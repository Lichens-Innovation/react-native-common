import * as SQLite from 'expo-sqlite';
import { logger } from '../logger/logger';
import { nowAsDateTimeForFilename } from './date.utils';
import { getErrorMessage } from './errors.utils';
import { createDirectoryStructure, getDocumentFullFilename, isFileExists } from './file.utils';
export const getSQLiteVersion = async () => {
    var _a;
    try {
        const db = await SQLite.openDatabaseAsync(':memory:');
        const result = await db.getFirstAsync('SELECT sqlite_version() as version');
        await db.closeAsync();
        return (_a = result === null || result === void 0 ? void 0 : result.version) !== null && _a !== void 0 ? _a : 'Unknown';
    }
    catch (e) {
        const message = getErrorMessage(e);
        logger.error(`[getSQLiteVersion] ${message}`, e);
        throw new Error(`[getSQLiteVersion] ${message}`);
    }
};
export const createDbFolderUri = async () => {
    const dbFolderUri = getDocumentFullFilename('SQLite');
    const exists = await isFileExists(dbFolderUri);
    if (!exists) {
        await createDirectoryStructure(dbFolderUri);
    }
};
export const getUniqueDbFilename = (prefix = '') => {
    const nowAsFilename = nowAsDateTimeForFilename();
    return `${prefix}${nowAsFilename}.db`;
};
export const createDbInstance = async (existingFilename) => {
    await createDbFolderUri();
    const dbFilename = existingFilename !== null && existingFilename !== void 0 ? existingFilename : getUniqueDbFilename();
    const db = await SQLite.openDatabaseAsync(dbFilename);
    return { db, dbFilename };
};
//# sourceMappingURL=sqlite.utils.js.map
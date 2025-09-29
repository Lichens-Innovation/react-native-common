import { format } from 'date-fns';
import { commonLogsStore } from '../store/common-logs.store';
import { notImplementedYet } from '../utils/platform.utils';
import { toLogLevel } from './logger.utils';
const WindowsStorage = Windows.Storage;
const localFolder = WindowsStorage.ApplicationData.current.localFolder;
class LoggerWrapper {
    constructor() {
        this._file = null;
    }
    get todayFilename() {
        return `rinno-desktop-${format(new Date(), 'yyyy-MM-dd')}.log`;
    }
    async createTodayFile() {
        return localFolder.createFileAsync(this.todayFilename, WindowsStorage.CreationCollisionOption.openIfExists);
    }
    async getOrCreateTodayFile() {
        var _a;
        if (((_a = this._file) === null || _a === void 0 ? void 0 : _a.name) === this.todayFilename) {
            return this._file;
        }
        this._file = await this.createTodayFile();
        return this._file;
    }
    async appendMessage(type, message, ...args) {
        const typeLabel = type.toUpperCase().padEnd(5, ' ');
        const formattedMessage = message.replace(/\n/g, '\n    ');
        const formattedUpdatedAt = new Date().toISOString();
        const stringifiedArgs = (args === null || args === void 0 ? void 0 : args.length) ? JSON.stringify(args) : '';
        const info = `${formattedUpdatedAt} ${typeLabel} : ${formattedMessage} ${stringifiedArgs}`;
        // append to file
        const file = await this.getOrCreateTodayFile();
        WindowsStorage.FileIO.appendTextAsync(file, `${info}\n`);
        // add to in-memory store
        commonLogsStore.addLog({ msg: info, rawMsg: message, level: toLogLevel(type) });
    }
    debug(message, ...args) {
        this.appendMessage('DEBUG', message, ...args);
    }
    log(message, ...args) {
        this.appendMessage('LOG', message, ...args);
    }
    info(message, ...args) {
        this.appendMessage('INFO', message, ...args);
    }
    warn(message, ...args) {
        this.appendMessage('WARN', message, ...args);
    }
    error(message, ...args) {
        this.appendMessage('ERROR', message, ...args);
    }
}
export const logger = new LoggerWrapper();
export const loadAllLogFilesInfo = async () => {
    notImplementedYet('loadAllLogFilesInfo');
    return [];
};
export const loadCurrentLogsFileUri = async () => {
    notImplementedYet('loadCurrentLogsFileUri');
    return '';
};
export const deleteAllLogFiles = async () => {
    notImplementedYet('deleteAllLogFiles');
};
//# sourceMappingURL=logger.windows.js.map
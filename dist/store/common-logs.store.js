import { makeAutoObservable } from 'mobx';
const MAX_LOG_ENTRIES = 10 * 1000;
class CommonLogsStore {
    constructor() {
        this.logEntries = [];
        makeAutoObservable(this);
    }
    get allLogsAsText() {
        return this.logEntries
            .map((log) => log.msg)
            .filter((log) => !!log)
            .join('\n');
    }
    addLog(logEntry) {
        this.logEntries.push(logEntry);
        if (this.logEntries.length > MAX_LOG_ENTRIES) {
            this.logEntries.shift(); // remove the oldest log
        }
    }
    clearLogs() {
        this.logEntries = [];
    }
    filterLogs(filterText) {
        const lowerCaseFilterText = filterText.toLowerCase();
        return this.logEntries.filter((log) => log.msg.toLowerCase().includes(lowerCaseFilterText));
    }
}
export const commonLogsStore = new CommonLogsStore();
export const commonLogsStoreTransport = (props) => {
    commonLogsStore.addLog(props);
};
//# sourceMappingURL=common-logs.store.js.map
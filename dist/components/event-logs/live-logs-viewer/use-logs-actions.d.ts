export declare const useLogsActions: () => {
    filterText: string;
    setFilterText: import("react").Dispatch<import("react").SetStateAction<string>>;
    filteredLogs: import("../../..").LogEntry[];
    handleCopyAllLogs: () => Promise<void>;
};

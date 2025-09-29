export const formatLogMessage = (msg) => {
    // remove the DATE part of the timestamp from the very beginning of the message (ISO 8601 format)
    // this allows to have a more readable log message on small devices
    return msg.substring(11);
};
//# sourceMappingURL=logs-viewer.utils.js.map
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import Handlebars from 'handlebars';
import uuid from 'react-native-uuid';
Handlebars.registerHelper('timestampFormat', (timestamp, dateTimeFormatInput) => {
    const dateTimeFormat = Handlebars.escapeExpression(dateTimeFormatInput);
    const formattedDateTime = formatInTimeZone(timestamp, 'UTC', dateTimeFormat);
    return new Handlebars.SafeString(formattedDateTime);
});
/**
 * Transforms a pattern string into a handlebars template string
 * Example: from "RVMAX360_{{{HH:mm:ss}}}" ===> "RVMAX360_{{timestampFormat timestamp arg1}}"
 *
 * @param inputPattern - the pattern string to transform
 * @returns the handlebars template string and the arguments
 */
const toHandlebarsTemplate = (inputPattern) => {
    const cleanedInput = Handlebars.escapeExpression(inputPattern);
    const args = {};
    let argCounter = 1;
    const handlebarTemplate = cleanedInput.replace(/{{{(.*?)}}}/g, (_match, content) => {
        const argName = `arg${argCounter}`;
        args[argName] = content;
        argCounter++;
        return `{{timestampFormat timestamp ${argName}}}`;
    });
    return Object.assign({ handlebarTemplate }, args);
};
const normalizeIsoInfo = (input) => {
    return input.replace(/[:\.]/g, '_');
};
/**
 * Builds additional context data for the handlebars template.
 * Example: { unixTimestamp: "1234567890", utcDate: "2022-01-01", ... }
 *
 * @returns a record with additional context data
 */
export const buildAdditionalContextData = (timestamp = new Date()) => {
    const infos = {};
    const isoString = timestamp.toISOString();
    const isoDateStringParts = isoString.split('T');
    infos.isoString = normalizeIsoInfo(isoString);
    infos.isoDate = isoDateStringParts[0];
    infos.isoTime = normalizeIsoInfo(isoDateStringParts[1].split('.')[0]);
    infos.localDate = format(timestamp, 'yyyy-MM-dd');
    infos.localTime = format(timestamp, 'HH_mm_ss');
    infos.timezoneOffset = timestamp.getTimezoneOffset().toString();
    infos.uuid = uuid.v4();
    infos.unixTimestamp = timestamp.getTime().toString();
    return infos;
};
export const applyFilenameTemplate = ({ filename, pattern, timestamp = new Date() }) => {
    if (!pattern) {
        return filename;
    }
    const _a = toHandlebarsTemplate(pattern), { handlebarTemplate } = _a, args = __rest(_a, ["handlebarTemplate"]);
    const template = Handlebars.compile(handlebarTemplate);
    return template(Object.assign(Object.assign(Object.assign({}, args), buildAdditionalContextData(timestamp)), { timestamp,
        filename }));
};
//# sourceMappingURL=filename.utils.js.map
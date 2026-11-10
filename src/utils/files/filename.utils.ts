import { isBlank } from '@lichens-innovation/ts-common';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import Handlebars from 'handlebars';
import uuid from 'react-native-uuid';

export const hasFileSeparator = (fileUri = ''): boolean => {
  return fileUri?.includes('/') ?? false;
};

export const getFilenameOnly = (fileUri = '/') => {
  if (hasFileSeparator(fileUri)) {
    return fileUri.split('/').pop() ?? '';
  } else {
    return fileUri;
  }
};

export const hasExtension = (fileUri = '/'): boolean => {
  const filename = getFilenameOnly(fileUri);
  return filename.includes('.');
};

export const getFilenameWithoutExtension = (fileUri = '/') => {
  const filename = getFilenameOnly(fileUri);

  if (hasExtension(fileUri)) {
    return filename.split('.').slice(0, -1).join('.');
  } else {
    return filename;
  }
};

export const getFileExtensionOnly = (fileUri = '/') => {
  const filename = getFilenameOnly(fileUri);
  if (hasExtension(fileUri)) {
    return filename.split('.').pop()?.toLowerCase() ?? '';
  } else {
    return '';
  }
};

/** Returns e.g. '/path/to' for '/path/to/file.txt', or an empty string when there is no directory. habit-hooks-disable non-essential-comment */
export const getDirectoryOnly = (fileUri = '/') => fileUri.substring(0, fileUri.lastIndexOf('/'));

Handlebars.registerHelper('timestampFormat', (timestamp: Date, dateTimeFormatInput: string) => {
  const dateTimeFormat = Handlebars.escapeExpression(dateTimeFormatInput);
  const formattedDateTime = formatInTimeZone(timestamp, 'UTC', dateTimeFormat);
  return new Handlebars.SafeString(formattedDateTime);
});

type HandlebarTemplateWithArgs = {
  handlebarTemplate: string;
} & Record<string, string>;

// Example: "MyPrefix_{{{HH:mm:ss}}}" ===> "MyPrefix_{{timestampFormat timestamp arg1}}" + { arg1: 'HH:mm:ss' } habit-hooks-disable non-essential-comment
const toHandlebarsTemplate = (inputPattern: string): HandlebarTemplateWithArgs => {
  const cleanedInput = Handlebars.escapeExpression(inputPattern);
  const args: Record<string, string> = {};

  let argCounter = 1;
  const handlebarTemplate = cleanedInput.replace(/{{{(.*?)}}}/g, (_match, content: string) => {
    const argName = `arg${argCounter}`;
    args[argName] = content;
    argCounter++;
    return `{{timestampFormat timestamp ${argName}}}`;
  });

  return { handlebarTemplate, ...args };
};

const normalizeIsoInfo = (input: string) => {
  return input.replace(/[:.]/g, '_');
};

export const buildAdditionalContextData = (timestamp = new Date()): Record<string, string> => {
  const infos: Record<string, string> = {};

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

interface ApplyFilenameTemplateArgs {
  filename?: string;
  pattern?: string;
  timestamp?: Date;
}

export const applyFilenameTemplate = ({ filename, pattern, timestamp = new Date() }: ApplyFilenameTemplateArgs) => {
  if (isBlank(pattern)) {
    return filename;
  }

  const { handlebarTemplate, ...args } = toHandlebarsTemplate(pattern);
  const template = Handlebars.compile(handlebarTemplate);

  return template({
    ...args,
    ...buildAdditionalContextData(timestamp),
    timestamp,
    filename,
  });
};

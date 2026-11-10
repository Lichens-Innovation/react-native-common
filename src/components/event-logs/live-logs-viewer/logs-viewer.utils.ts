const ISO_DATE_PREFIX_LENGTH = 'YYYY-MM-DDT'.length;

export const formatLogMessage = (msg: string): string => msg.substring(ISO_DATE_PREFIX_LENGTH);

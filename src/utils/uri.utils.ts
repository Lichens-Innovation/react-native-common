export const SCHEME_PREFIXES = {
  file: 'file',
  content: 'content',
  http: 'http',
  https: 'https',
  ftp: 'ftp',
  ftps: 'ftps',
  sftp: 'sftp',
  smb: 'smb',
} as const;

const SCHEME_PREFIXES_ARRAY = Object.values(SCHEME_PREFIXES);

export const hasScheme = (uri?: string | null): boolean => {
  if (!uri) {
    return false;
  }

  const lowerUri = uri.toLowerCase();
  return SCHEME_PREFIXES_ARRAY.some((prefix) => lowerUri.startsWith(`${prefix}://`));
};

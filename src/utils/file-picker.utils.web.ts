import { notImplementedYet } from './platform.utils';

export const pickSingleFile = async () => {
  notImplementedYet(
    '[File picker] pickSingleFile — native document picker (expo-document-picker) is not implemented on web'
  );
  return { exists: false, error: 'canceled', name: '', uri: '', size: 0, mimeType: '', lastModified: 0 };
};

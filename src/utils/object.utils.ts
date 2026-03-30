export type MediaType = 'image' | 'video' | 'audio';

export const IMAGE_EXTENSIONS = new Set([
  'jpg',
  'jpeg',
  'png',
  'gif',
  'bmp',
  'webp',
  'svg',
  'tiff',
  'tif',
  'heic',
  'heif',
  'avif',
]);

export const VIDEO_EXTENSIONS = new Set([
  'mp4',
  'mov',
  'avi',
  'mkv',
  'webm',
  'flv',
  'wmv',
  'm4v',
  '3gp',
  'mpeg',
  'mpg',
]);

export const AUDIO_EXTENSIONS = new Set(['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'opus']);

export const getMediaTypeFromUri = (uri: string | null | undefined): MediaType | undefined => {
  if (!uri) return undefined;

  // Remove query params and hash fragments
  const cleanUri = uri.split('?')[0].split('#')[0];

  // Extract extension safely
  const match = cleanUri.match(/\.([a-zA-Z0-9]+)$/);
  if (!match) return undefined;

  const extension = match[1].toLowerCase();

  if (IMAGE_EXTENSIONS.has(extension)) return 'image';
  if (VIDEO_EXTENSIONS.has(extension)) return 'video';
  if (AUDIO_EXTENSIONS.has(extension)) return 'audio';

  return undefined;
};

import * as VideoThumbnails from 'expo-video-thumbnails';

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

async function getVideoThumbnail(uri: string): Promise<{ uri: string }> {
  const times = [500, 1000, 0]; // ms - try to get thumbnail at 0.5s, then 1s, then 0s (sometimes videos have issues generating thumbnails at 0ms, so we try a few options if necessary)
  for (const t of times) {
    try {
      return await VideoThumbnails.getThumbnailAsync(uri, { time: t, quality: 0.7 });
    } catch (_) {}
  }
  return { uri: '' };
}

export const getThumbnailUri = async (uri: string | null | undefined, mediaType: MediaType): Promise<string> => {
  if (!uri) return '';
  if (mediaType === 'image') {
    return uri;
  } else if (mediaType === 'video') {
    // We need to create a thumbnail from the video
    const thumbnail = await getVideoThumbnail(uri);
    return thumbnail.uri;
  } else {
    return '';
  }
};

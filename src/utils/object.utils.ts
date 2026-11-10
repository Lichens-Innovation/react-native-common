import { isBlank } from '@lichens-innovation/ts-common';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { logger } from '../logger/logger';

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

export const getMediaTypeFromUri = (uri?: string | null): MediaType | undefined => {
  if (isBlank(uri)) return undefined;

  const uriWithoutQueryAndHash = uri.split('?')[0].split('#')[0];
  const extensionMatch = uriWithoutQueryAndHash.match(/\.([a-zA-Z0-9]+)$/);
  if (!extensionMatch) return undefined;

  const extension = extensionMatch[1].toLowerCase();

  if (IMAGE_EXTENSIONS.has(extension)) return 'image';
  if (VIDEO_EXTENSIONS.has(extension)) return 'video';
  if (AUDIO_EXTENSIONS.has(extension)) return 'audio';

  return undefined;
};

// Generating a thumbnail at 0ms sometimes fails, so 0.5s and 1s are tried first. habit-hooks-disable non-essential-comment
const THUMBNAIL_CANDIDATE_TIMES_MS = [500, 1000, 0];

interface VideoThumbnail {
  uri: string;
}

const getVideoThumbnail = async (uri: string): Promise<VideoThumbnail> => {
  for (const time of THUMBNAIL_CANDIDATE_TIMES_MS) {
    try {
      return await VideoThumbnails.getThumbnailAsync(uri, { time, quality: 0.7 });
    } catch (e: unknown) {
      logger.debug(`[getVideoThumbnail] No thumbnail at ${time}ms for [${uri}]`, e);
    }
  }
  return { uri: '' };
};

export const getThumbnailUri = async (
  // eslint-disable-next-line coding-guide/no-explicit-undefined-optional -- public API: `?` impossible before required params, callers may pass undefined
  uri: string | null | undefined,
  mediaType: MediaType
): Promise<string> => {
  if (isBlank(uri)) return '';
  if (mediaType === 'image') {
    return uri;
  } else if (mediaType === 'video') {
    const thumbnail = await getVideoThumbnail(uri);
    return thumbnail.uri;
  } else {
    return '';
  }
};

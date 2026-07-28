import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { logger } from '../logger/logger';

/**
 * JPEG compression factor applied when normalizing images added from the app.
 * 1 = no compression (highest quality), 0 = highest compression.
 */
export const IMAGE_JPEG_COMPRESSION = 0.8;

function getExtension(uri: string): string {
  const clean = uri.split('?')[0].split('#')[0];
  const match = clean.match(/\.([a-zA-Z0-9]+)$/);
  return match ? match[1].toLowerCase() : '';
}

export function isHeicUri(uri: string | null | undefined): boolean {
  if (!uri) return false;
  const ext = getExtension(uri);
  return ext === 'heic' || ext === 'heif';
}

/**
 * Convert and compress an image to JPEG on the local filesystem.
 * Always re-encodes (including existing JPEGs) so every image is compressed.
 * Returns the new file uri, or the original uri if conversion fails.
 */
export async function normalizeImageToJpeg(uri: string, compress: number = IMAGE_JPEG_COMPRESSION): Promise<string> {
  if (!uri) return uri;
  try {
    const image = await ImageManipulator.manipulate(uri).renderAsync();
    const result = await image.saveAsync({ format: SaveFormat.JPEG, compress });
    return result.uri;
  } catch (error) {
    logger.error('Failed to normalize image to JPEG, keeping original:', error);
    return uri;
  }
}

export async function normalizeImagesToJpeg(
  uris: string[],
  compress: number = IMAGE_JPEG_COMPRESSION
): Promise<string[]> {
  return Promise.all(uris.map((uri) => normalizeImageToJpeg(uri, compress)));
}

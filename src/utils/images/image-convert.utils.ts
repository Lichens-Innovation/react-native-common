import { isBlank } from '@lichens-innovation/ts-common';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { logger } from '../../logger/logger';

/** habit-hooks-disable non-essential-comment
 * JPEG compression factor applied when normalizing images added from the app.
 * 1 = no compression (highest quality), 0 = highest compression.
 */
export const IMAGE_JPEG_COMPRESSION = 0.8;

const getExtension = (uri: string): string => {
  const clean = uri.split('?')[0].split('#')[0];
  const match = clean.match(/\.([a-zA-Z0-9]+)$/);
  return match ? match[1].toLowerCase() : '';
};

export const isHeicUri = (uri?: string | null): boolean => {
  if (isBlank(uri)) return false;
  const ext = getExtension(uri);
  return ['heic', 'heif'].includes(ext);
};

/** habit-hooks-disable non-essential-comment
 * Image formats that can hold an animation.
 *
 * JPEG holds exactly one frame, so re-encoding one of these to JPEG keeps the first frame and silently
 * throws the rest away — the one thing the format was chosen for. The extension cannot tell us whether
 * a particular file actually animates, so the whole format is treated as animatable, static files
 * included: leaving a static GIF uncompressed is a much cheaper mistake than flattening a moving one.
 */
export const ANIMATABLE_IMAGE_EXTENSIONS = new Set(['gif', 'webp']);

export const isAnimatableImageUri = (uri?: string | null): boolean => {
  if (isBlank(uri)) return false;
  return ANIMATABLE_IMAGE_EXTENSIONS.has(getExtension(uri));
};

/** habit-hooks-disable non-essential-comment
 * Convert and compress an image to JPEG on the local filesystem.
 * Re-encodes existing JPEGs too, so every image that goes through here is compressed.
 * Returns the new file uri, or the original uri if conversion fails or would destroy the image.
 */
export const normalizeImageToJpeg = async (uri: string, compress: number = IMAGE_JPEG_COMPRESSION): Promise<string> => {
  if (isBlank(uri)) return uri;
  /* habit-hooks-disable non-essential-comment
   * A GIF or WebP picked from the gallery may be animated, and JPEG cannot hold an animation: the
   * normalized copy would be its first frame, with nothing to say the rest was dropped. Handed back
   * untouched instead, which is the same thing this function already does when conversion fails. */
  if (isAnimatableImageUri(uri)) return uri;
  try {
    const image = await ImageManipulator.manipulate(uri).renderAsync();
    const result = await image.saveAsync({ format: SaveFormat.JPEG, compress });
    return result.uri;
  } catch (error) {
    logger.error('Failed to normalize image to JPEG, keeping original:', error);
    return uri;
  }
};

export const normalizeImagesToJpeg = async (
  uris: string[],
  compress: number = IMAGE_JPEG_COMPRESSION
): Promise<string[]> => {
  return Promise.all(uris.map((uri) => normalizeImageToJpeg(uri, compress)));
};

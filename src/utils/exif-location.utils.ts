import * as Exify from '@lodev09/react-native-exify';
import type { ExifTags } from '@lodev09/react-native-exify';
import type { LocationObject } from 'expo-location';
import { logger } from '../logger/logger';

/**
 * The only EXIF tags carried from an original photo into its re-encoded JPEG: where and when it was taken.
 *
 * Re-encoding drops every tag, and that is mostly wanted — device make, model and serial-like fields have no
 * business leaving the phone. Orientation is deliberately absent: the re-encode already bakes the rotation
 * into the pixels, so copying it would rotate the image a second time.
 */
const GPS_TAGS = [
  'GPSLatitude',
  'GPSLatitudeRef',
  'GPSLongitude',
  'GPSLongitudeRef',
  'GPSAltitude',
  'GPSAltitudeRef',
  'GPSDateStamp',
  'GPSTimeStamp',
  'GPSHPositioningError',
] as const satisfies readonly (keyof ExifTags)[];

const DATE_TAGS = ['DateTimeOriginal'] as const satisfies readonly (keyof ExifTags)[];

type CarriedTag = (typeof GPS_TAGS)[number] | (typeof DATE_TAGS)[number];

const isPresent = (value: unknown): boolean => value !== undefined && value !== null && value !== '';

export function hasGpsPosition(tags: ExifTags | null | undefined): boolean {
  return isPresent(tags?.GPSLatitude) && isPresent(tags?.GPSLongitude);
}

function copyTags(source: ExifTags, keys: readonly CarriedTag[], target: ExifTags): void {
  for (const key of keys) {
    if (isPresent(source[key])) Object.assign(target, { [key]: source[key] });
  }
}

/**
 * Keeps the position and capture date of a photo's EXIF, in the shape exify reads them on both platforms
 * (absolute coordinates with their N/S, E/W and altitude refs), which its write accepts back as is.
 * GPS tags without both coordinates are dropped: a timestamp alone does not locate anything.
 */
export function pickLocationTags(tags: ExifTags | null | undefined): ExifTags {
  const picked: ExifTags = {};
  if (!tags) return picked;
  if (hasGpsPosition(tags)) copyTags(tags, GPS_TAGS, picked);
  copyTags(tags, DATE_TAGS, picked);
  return picked;
}

const pad2 = (value: number): string => String(value).padStart(2, '0');

/**
 * Device position as GPS tags. Coordinates and altitude are signed: exify derives the refs from the sign.
 * The GPS date and time are UTC, as the EXIF standard defines them.
 */
export function positionToGpsTags(position: LocationObject): ExifTags {
  const { latitude, longitude, altitude, accuracy } = position.coords;
  const fixedAt = new Date(position.timestamp);
  const tags: ExifTags = {
    GPSLatitude: latitude,
    GPSLongitude: longitude,
    GPSDateStamp: `${fixedAt.getUTCFullYear()}:${pad2(fixedAt.getUTCMonth() + 1)}:${pad2(fixedAt.getUTCDate())}`,
    GPSTimeStamp: `${pad2(fixedAt.getUTCHours())}:${pad2(fixedAt.getUTCMinutes())}:${pad2(fixedAt.getUTCSeconds())}`,
  };
  if (altitude !== null && altitude !== undefined) tags.GPSAltitude = altitude;
  if (accuracy !== null && accuracy !== undefined) tags.GPSHPositioningError = accuracy;
  return tags;
}

/** exify rejects bare paths; camera and picker URIs carry their scheme already, a cache path may not. */
const withScheme = (uri: string): string => (uri.startsWith('/') ? `file://${uri}` : uri);

/** Position and capture date of the image at `uri`; empty when it has none or cannot be read. */
export async function readLocationTags(uri: string): Promise<ExifTags> {
  try {
    return pickLocationTags(await Exify.read(withScheme(uri)));
  } catch (error) {
    logger.warn('Failed to read photo EXIF, its location will not be kept:', error);
    return {};
  }
}

async function resolveFallbackTags(fallbackPosition?: Promise<LocationObject | null>): Promise<ExifTags> {
  if (!fallbackPosition) return {};
  try {
    const position = await fallbackPosition;
    return position ? positionToGpsTags(position) : {};
  } catch (error) {
    logger.warn('Failed to get the device position for the photo:', error);
    return {};
  }
}

/**
 * Writes the original's location tags into the re-encoded `targetUri`. When the original has no GPS position,
 * the fallback position (the device's, for a photo taken in the app) fills it. Nothing to write means no
 * write at all: on iOS writing re-encodes the image once more. A failure leaves the photo without location
 * rather than losing the photo.
 */
export async function writeLocationTags(
  targetUri: string,
  sourceTags: ExifTags,
  fallbackPosition?: Promise<LocationObject | null>
): Promise<void> {
  const tags = hasGpsPosition(sourceTags)
    ? sourceTags
    : { ...sourceTags, ...(await resolveFallbackTags(fallbackPosition)) };
  if (Object.keys(tags).length === 0) return;
  try {
    await Exify.write(withScheme(targetUri), tags);
  } catch (error) {
    logger.warn('Failed to write the location into the photo EXIF:', error);
  }
}

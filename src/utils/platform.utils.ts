import { Platform } from 'react-native';

/**
 * Log a clear, human-readable reason when a code path is intentionally missing on this platform.
 * Does not use `logger` here: `logger.*.ts` stubs call this and would create a circular import.
 *
 * @param reason What is not implemented and on which surface (e.g. `[Wi‑Fi] fetchWifiInfo — …`).
 * @param context Optional values for debugging (URIs, ids, etc.).
 */
export const notImplementedYet = (reason: string, ...context: unknown[]) => {
  // eslint-disable-next-line no-console -- bootstrap path; importing logger would cycle with logger.web / logger.windows
  console.debug(`[react-native-common] Not implemented (${Platform.OS}): ${reason}`, ...context);
};

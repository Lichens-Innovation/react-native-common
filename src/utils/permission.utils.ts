import { Linking, Platform } from 'react-native';
import { logger } from '../logger/logger';

/** The part of an expo PermissionResponse that decides how access can still be obtained. */
export interface PermissionState {
  granted: boolean;
  canAskAgain: boolean;
}

export interface PermissionRequestOptions {
  /** A request was already made since the permission UI was opened (see `resolvePermissionRequest`). */
  askedThisSession?: boolean;
}

/**
 * - `granted`: nothing to do.
 * - `prompt`: the OS may still show its own permission prompt.
 * - `settings`: the OS will no longer prompt (denied once on iOS, "don't ask again" or revoked from the
 *   device settings): asking again silently resolves to denied, only the app settings can change it.
 *
 * Android reports `canAskAgain: false` both when the permission is blocked and when it is set to "Ask
 * every time" — the latter does prompt. Only an answered request tells them apart, so on Android
 * `canAskAgain` is trusted once a request was made this session.
 */
export type PermissionRequestAction = 'granted' | 'prompt' | 'settings';

export const resolvePermissionRequest = (
  permission: PermissionState | null | undefined,
  { askedThisSession = false }: PermissionRequestOptions = {}
): PermissionRequestAction => {
  if (permission?.granted) return 'granted';
  if (!permission || permission.canAskAgain) return 'prompt';
  if (Platform.OS === 'android' && !askedThisSession) return 'prompt';
  return 'settings';
};

export const openAppSettings = async (): Promise<void> => {
  try {
    await Linking.openSettings();
  } catch (e) {
    logger.error('[openAppSettings] error opening the app settings', e);
  }
};

/**
 * - `granted`: carry on.
 * - `denied`: the user answered no to the OS prompt.
 * - `blocked`: Android only — the request came back unable to prompt, perhaps without showing anything:
 *   offer the settings next, with `askedThisSession` set.
 * - `settingsOpened`: the user was sent to the app settings and only comes back later.
 */
export type PermissionRequestOutcome = 'granted' | 'denied' | 'blocked' | 'settingsOpened';

/** Shows the OS prompt when it may still, otherwise sends the user to the app settings. */
export const requestPermissionOrOpenSettings = async (
  permission: PermissionState | null | undefined,
  request: () => Promise<PermissionState>,
  options: PermissionRequestOptions = {}
): Promise<PermissionRequestOutcome> => {
  const action = resolvePermissionRequest(permission, options);
  if (action === 'granted') return 'granted';

  if (action === 'prompt') {
    const response = await request();
    if (response.granted) return 'granted';
    return Platform.OS === 'android' && !response.canAskAgain ? 'blocked' : 'denied';
  }

  await openAppSettings();
  return 'settingsOpened';
};

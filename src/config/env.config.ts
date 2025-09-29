import { storage } from '../utils/storage';

export const isSentryActivated = (): boolean => storage.getItem<string>('SENTRY_ACTIVATED', '') === 'true';
export const getSentryDns = (): string => storage.getItem('SENTRY_DNS', '') ?? '';

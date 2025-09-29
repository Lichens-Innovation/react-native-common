import { commonSettingsStore } from '../store/common-settings.store';
import { storage } from '../utils/storage';
export const isSentryActivated = () => storage.getItem('SENTRY_ACTIVATED', '') === 'true';
export const getSentryDns = () => { var _a; return (_a = storage.getItem('SENTRY_DNS', '')) !== null && _a !== void 0 ? _a : ''; };
export const getIonodesAdminPassword = () => commonSettingsStore.ionodesAdminPassword;
//# sourceMappingURL=env.config.js.map
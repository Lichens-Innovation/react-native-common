import * as SecureStore from 'expo-secure-store';
import { makeAutoObservable } from 'mobx';
import { makePersistable } from 'mobx-persist-store';
import { mmkvStorageForMobxPersist } from '../utils/storage';
const DEFAULT_LAST_KNOWN_CAMERA_IP = '192.168.0.0';
class CommonSettingsStore {
    constructor() {
        var _a;
        this.lastKnownCameraIP = DEFAULT_LAST_KNOWN_CAMERA_IP;
        this.ionodesAdminPassword = '';
        makeAutoObservable(this);
        makePersistable(this, {
            name: 'CommonSettings',
            properties: ['lastKnownCameraIP'],
            storage: mmkvStorageForMobxPersist,
        });
        this.ionodesAdminPassword = (_a = SecureStore.getItem('ionodesAdminPassword')) !== null && _a !== void 0 ? _a : '';
    }
    setLastKnownCameraIP(ip) {
        if (!ip || ip === this.lastKnownCameraIP) {
            return;
        }
        this.lastKnownCameraIP = ip;
    }
    get hasIonodesAdminPassword() {
        return !!this.ionodesAdminPassword;
    }
    setIonodesAdminPassword(password) {
        SecureStore.setItem('ionodesAdminPassword', password);
        this.ionodesAdminPassword = password;
    }
}
export const commonSettingsStore = new CommonSettingsStore();
//# sourceMappingURL=common-settings.store.js.map
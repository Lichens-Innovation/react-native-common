import { makeAutoObservable } from 'mobx';
import { makePersistable } from 'mobx-persist-store';
import { mmkvStorageForMobxPersist } from '../utils/storage';
const DEFAULT_DARK_MODE = true;
class CommonStore {
    constructor() {
        this.isDarkMode = DEFAULT_DARK_MODE;
        makeAutoObservable(this);
        makePersistable(this, {
            name: 'CommonStore',
            properties: ['isDarkMode'],
            storage: mmkvStorageForMobxPersist,
        });
    }
    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
    }
    setIsDarkMode(isDarkMode) {
        this.isDarkMode = isDarkMode;
    }
}
export const commonStore = new CommonStore();
//# sourceMappingURL=common.store.js.map
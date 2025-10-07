import { makeAutoObservable, runInAction } from 'mobx';
import { makePersistable } from 'mobx-persist-store';
import { AppState, AppStateStatus } from 'react-native';
import { logger } from '../logger/logger';
import { mmkvStorageForMobxPersist } from '../utils/storage';

const DEFAULT_DARK_MODE = true;

class CommonStore {
  isDarkMode: boolean = DEFAULT_DARK_MODE;
  appStatus: AppStateStatus = 'active';

  constructor() {
    makeAutoObservable(this);
    makePersistable(this, {
      name: 'CommonStore',
      properties: ['isDarkMode'],
      storage: mmkvStorageForMobxPersist,
    }).then(() => {
      logger.info('[CommonStore] Hydration complete');
    });

    // Note: no need to remove the listener since it's attached to the lifecycle of the running app
    AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === this.appStatus) return;

      runInAction(() => {
        logger.info(`[CommonStore] App state changed to ${nextAppState}`);
        this.appStatus = nextAppState;
      });
    });
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
  }

  setIsDarkMode(isDarkMode: boolean) {
    this.isDarkMode = isDarkMode;
  }
}

export const commonStore = new CommonStore();

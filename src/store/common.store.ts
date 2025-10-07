import { makeAutoObservable, runInAction } from 'mobx';
import { makePersistable } from 'mobx-persist-store';
import { AppState, AppStateStatus, NativeEventSubscription } from 'react-native';
import { logger } from '../logger/logger';
import { mmkvStorageForMobxPersist } from '../utils/storage';

const DEFAULT_DARK_MODE = true;

class CommonStore {
  isDarkMode: boolean = DEFAULT_DARK_MODE;
  appStatus: AppStateStatus = 'active';
  appStateSubscription?: NativeEventSubscription;

  constructor() {
    makeAutoObservable(this);
    makePersistable(this, {
      name: 'CommonStore',
      properties: ['isDarkMode'],
      storage: mmkvStorageForMobxPersist,
    }).then(() => {
      logger.info('[CommonStore] Hydration complete');
    });

    this.appStateSubscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
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

  dispose() {
    this.appStateSubscription?.remove();
  }
}

export const commonStore = new CommonStore();

import { makeAutoObservable } from 'mobx';
import { makePersistable } from 'mobx-persist-store';
import { mmkvStorageForMobxPersist } from '../utils/storage';

const DEFAULT_DARK_MODE = true;

class CommonStore {
  isDarkMode: boolean = DEFAULT_DARK_MODE;

  constructor() {
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

  setIsDarkMode(isDarkMode: boolean) {
    this.isDarkMode = isDarkMode;
  }
}

export const commonStore = new CommonStore();

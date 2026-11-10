import { initReactI18next as commonInitReactI18next } from 'react-i18next';
import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  initCommonI18N,
  languageDetector,
  loadSelectedLanguage,
  storeSelectedLanguage,
} from '@lib';
import { getMockLogger, getMockMmkv } from './core-test.utils';

const mmkv = getMockMmkv();
const mockLogger = getMockLogger();

type Handler = (value: unknown) => unknown;

interface FakeI18nInstance {
  use: jest.Mock<FakeI18nInstance, [module: unknown]>;
  init: jest.Mock<unknown, []>;
}

const createFakeI18nInstance = (initResult: unknown = Promise.resolve()): FakeI18nInstance => {
  const instance: FakeI18nInstance = {
    use: jest.fn((_module: unknown) => instance),
    init: jest.fn(() => initResult),
  };
  return instance;
};

const appInitReactI18next = { type: '3rdParty', init: jest.fn() };

describe('i18n', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('exposes supported languages and fr as default', () => {
    expect(DEFAULT_LANGUAGE).toBe('fr');
    expect(SUPPORTED_LANGUAGES.map(({ code }) => code)).toEqual(['fr', 'en']);
  });

  it('storeSelectedLanguage / loadSelectedLanguage use MMKV key appLanguage with fr fallback', () => {
    // arrange
    mmkv.getString.mockReturnValueOnce('en').mockReturnValueOnce(undefined);

    // act
    storeSelectedLanguage('en');
    const stored = loadSelectedLanguage();
    const fallback = loadSelectedLanguage();

    // assert
    expect(mmkv.set).toHaveBeenCalledWith('appLanguage', 'en');
    expect(mmkv.getString).toHaveBeenCalledWith('appLanguage');
    expect(stored).toBe('en');
    expect(fallback).toBe('fr');
  });

  describe('initCommonI18N', () => {
    it('registers detector + both react-i18next modules and inits with the saved language', () => {
      // arrange
      mmkv.getString.mockReturnValue('en');
      const instance = createFakeI18nInstance();

      // act
      const result = initCommonI18N({ initReactI18next: appInitReactI18next as never, instance: instance as never });

      // assert
      expect(result).toBe(instance);
      expect(instance.use.mock.calls.map(([module]) => module)).toEqual([
        languageDetector,
        commonInitReactI18next,
        appInitReactI18next,
      ]);
      expect(instance.init).toHaveBeenCalledWith(
        expect.objectContaining({
          defaultNS: 'common',
          fallbackLng: 'fr',
          lng: 'en',
          debug: false,
          interpolation: { escapeValue: false },
          resources: expect.objectContaining({ fr: expect.any(Object), en: expect.any(Object) }),
        })
      );
      expect(mmkv.set).not.toHaveBeenCalled();
      mmkv.getString.mockReset();
    });

    it('falls back to and stores the default language when the saved language is empty', () => {
      // arrange
      mmkv.getString.mockReturnValueOnce('');
      const instance = createFakeI18nInstance();

      // act
      initCommonI18N({ initReactI18next: appInitReactI18next as never, instance: instance as never });

      // assert
      expect(mmkv.set).toHaveBeenCalledWith('appLanguage', 'fr');
      expect(instance.init).toHaveBeenCalledWith(expect.objectContaining({ lng: 'fr' }));
    });

    it('treats a whitespace-only saved language as empty: stores and uses the default language', () => {
      // arrange
      mmkv.getString.mockReturnValueOnce('   ');
      const instance = createFakeI18nInstance();

      // act
      initCommonI18N({ initReactI18next: appInitReactI18next as never, instance: instance as never });

      // assert
      expect(mmkv.set).toHaveBeenCalledWith('appLanguage', 'fr');
      expect(instance.init).toHaveBeenCalledWith(expect.objectContaining({ lng: 'fr' }));
    });

    it('uses the default language when nothing was saved (default value returned, nothing stored)', () => {
      // arrange
      mmkv.getString.mockReturnValueOnce(undefined);
      const instance = createFakeI18nInstance();

      // act
      initCommonI18N({ initReactI18next: appInitReactI18next as never, instance: instance as never });

      // assert
      expect(mmkv.set).not.toHaveBeenCalled();
      expect(instance.init).toHaveBeenCalledWith(expect.objectContaining({ lng: 'fr' }));
    });

    it('handles an init failure by logging it as an error', () => {
      // arrange: a controllable thenable stands in for the init promise so the failure can be simulated
      const rejectionHandlers: Handler[] = [];
      const initResult = {
        then: (_onFulfilled?: Handler, onRejected?: Handler) => {
          if (onRejected) rejectionHandlers.push(onRejected);
          return initResult;
        },
        catch: (onRejected: Handler) => {
          rejectionHandlers.push(onRejected);
          return initResult;
        },
      };
      const instance = createFakeI18nInstance(initResult);
      const error = new Error('init failed');

      // act
      initCommonI18N({ initReactI18next: appInitReactI18next as never, instance: instance as never });
      rejectionHandlers.forEach((handler) => handler(error));

      // assert
      expect(rejectionHandlers).toHaveLength(1);
      expect(mockLogger.error).toHaveBeenCalledWith('[initCommonI18N] Failed to initialize i18n', error);
    });
  });
});

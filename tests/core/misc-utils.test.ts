import { AxiosError } from 'axios';
import * as Updates from 'expo-updates';
import { Linking, Platform } from 'react-native';
import {
  isAxiosNetworkError,
  isDevelopment,
  isPreview,
  isProduction,
  isValidIpAddressV4,
  openAppSettings,
  parseLicenceData,
  requestPermissionOrOpenSettings,
  resolvePermissionRequest,
  validateGetRandomValues,
} from '@lib';
import { getMockLogger } from './core-test.utils';

const mockLogger = getMockLogger();

describe('misc utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('resolvePermissionRequest', () => {
    it.each`
      os           | permission                                | askedThisSession | expected
      ${'ios'}     | ${undefined}                              | ${undefined}     | ${'prompt'}
      ${'ios'}     | ${null}                                   | ${undefined}     | ${'prompt'}
      ${'ios'}     | ${{ granted: true, canAskAgain: false }}  | ${undefined}     | ${'granted'}
      ${'ios'}     | ${{ granted: false, canAskAgain: true }}  | ${undefined}     | ${'prompt'}
      ${'ios'}     | ${{ granted: false, canAskAgain: false }} | ${undefined}     | ${'settings'}
      ${'android'} | ${{ granted: false, canAskAgain: false }} | ${undefined}     | ${'prompt'}
      ${'android'} | ${{ granted: false, canAskAgain: false }} | ${false}         | ${'prompt'}
      ${'android'} | ${{ granted: false, canAskAgain: false }} | ${true}          | ${'settings'}
      ${'android'} | ${{ granted: false, canAskAgain: true }}  | ${true}          | ${'prompt'}
    `('$os: $permission (asked: $askedThisSession) → $expected', ({ os, permission, askedThisSession, expected }) => {
      // arrange
      jest.replaceProperty(Platform, 'OS', os);

      // act
      const action =
        askedThisSession === undefined
          ? resolvePermissionRequest(permission)
          : resolvePermissionRequest(permission, { askedThisSession });

      // assert
      expect(action).toBe(expected);
    });
  });

  describe('requestPermissionOrOpenSettings', () => {
    it('returns granted without requesting when already granted', async () => {
      // arrange
      const request = jest.fn();

      // act
      const outcome = await requestPermissionOrOpenSettings({ granted: true, canAskAgain: true }, request);

      // assert
      expect(outcome).toBe('granted');
      expect(request).not.toHaveBeenCalled();
    });

    it.each`
      os           | response                                  | expected
      ${'ios'}     | ${{ granted: true, canAskAgain: true }}   | ${'granted'}
      ${'ios'}     | ${{ granted: false, canAskAgain: false }} | ${'denied'}
      ${'android'} | ${{ granted: false, canAskAgain: true }}  | ${'denied'}
      ${'android'} | ${{ granted: false, canAskAgain: false }} | ${'blocked'}
    `('$os prompt answered $response → $expected', async ({ os, response, expected }) => {
      // arrange
      jest.replaceProperty(Platform, 'OS', os);
      const request = jest.fn().mockResolvedValue(response);

      // act
      const outcome = await requestPermissionOrOpenSettings(undefined, request);

      // assert
      expect(outcome).toBe(expected);
      expect(request).toHaveBeenCalledTimes(1);
    });

    it('opens the app settings when the OS will not prompt anymore', async () => {
      // arrange
      jest.replaceProperty(Platform, 'OS', 'ios');
      const openSettings = jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined);
      const request = jest.fn();

      // act
      const outcome = await requestPermissionOrOpenSettings({ granted: false, canAskAgain: false }, request);

      // assert
      expect(outcome).toBe('settingsOpened');
      expect(request).not.toHaveBeenCalled();
      expect(openSettings).toHaveBeenCalled();
    });

    it('propagates a rejected request', async () => {
      // arrange
      const request = jest.fn().mockRejectedValue(new Error('native'));

      // act & assert
      await expect(requestPermissionOrOpenSettings(null, request)).rejects.toThrow('native');
    });
  });

  describe('openAppSettings', () => {
    it('logs instead of throwing when Linking fails', async () => {
      // arrange
      jest.spyOn(Linking, 'openSettings').mockRejectedValue(new Error('nope'));

      // act
      await expect(openAppSettings()).resolves.toBeUndefined();

      // assert
      expect(mockLogger.error).toHaveBeenCalledWith(
        '[openAppSettings] error opening the app settings',
        expect.any(Error)
      );
    });
  });

  describe('isAxiosNetworkError', () => {
    it.each`
      error                                  | expected
      ${new Error('x')}                      | ${false}
      ${undefined}                           | ${false}
      ${new AxiosError('x', 'ERR_NETWORK')}  | ${true}
      ${new AxiosError('x', 'ECONNABORTED')} | ${false}
      ${new AxiosError('x')}                 | ${false}
      ${new AxiosError('x', '')}             | ${false}
      ${new AxiosError('x', '  ')}           | ${false}
    `('returns $expected for $error', ({ error, expected }) => {
      expect(isAxiosNetworkError(error)).toBe(expected);
    });
  });

  describe('isValidIpAddressV4', () => {
    it.each`
      ip               | expected
      ${undefined}     | ${false}
      ${null}          | ${false}
      ${''}            | ${false}
      ${'  '}          | ${false}
      ${'192.168.1.1'} | ${true}
      ${'256.1.1.1'}   | ${false}
      ${'1.2.3'}       | ${false}
    `('returns $expected for "$ip"', ({ ip, expected }) => {
      expect(isValidIpAddressV4(ip)).toBe(expected);
    });
  });

  describe('parseLicenceData', () => {
    it('splits name and version and defaults missing fields to ""', () => {
      // act
      const result = parseLicenceData({
        '@scope/pkg@1.2.3': { licenses: 'MIT', repository: 'https://repo', licenseFile: '/LICENSE' },
        'plain@4.0.0': { licenses: 'ISC' },
        noversion: { licenses: 'BSD', repository: '', licenseFile: '' },
      });

      // assert
      expect(result).toEqual([
        {
          title: 'scope/pkg',
          version: '1.2.3',
          licenceType: 'MIT',
          repository: 'https://repo',
          licenseUrl: '/LICENSE',
        },
        { title: 'plain', version: '4.0.0', licenceType: 'ISC', repository: '', licenseUrl: '' },
        { title: 'noversion', version: '', licenceType: 'BSD', repository: '', licenseUrl: '' },
      ]);
    });

    it('maps null repository / licenseFile to ""', () => {
      // act
      const [entry] = parseLicenceData({ 'a@1': { licenses: 'MIT', repository: null, licenseFile: null } as never });

      // assert
      expect(entry.repository).toBe('');
      expect(entry.licenseUrl).toBe('');
    });
  });

  describe('env utils', () => {
    it.each`
      channel         | production | preview
      ${'production'} | ${true}    | ${false}
      ${'preview'}    | ${false}   | ${true}
      ${null}         | ${false}   | ${false}
      ${'  '}         | ${false}   | ${false}
    `('channel $channel → production $production, preview $preview', ({ channel, production, preview }) => {
      // arrange
      jest.replaceProperty(Updates, 'channel', channel);

      // act & assert
      expect(isProduction()).toBe(production);
      expect(isPreview()).toBe(preview);
    });

    it('isDevelopment is true under __DEV__ whatever the channel', () => {
      // arrange
      jest.replaceProperty(Updates, 'channel', 'production');

      // act & assert
      expect(isDevelopment()).toBe(true);
    });

    describe('isDevelopment outside __DEV__', () => {
      const globalWithDev = globalThis as unknown as { __DEV__: boolean };
      const originalDev = globalWithDev.__DEV__;

      beforeEach(() => {
        globalWithDev.__DEV__ = false;
      });

      afterEach(() => {
        globalWithDev.__DEV__ = originalDev;
      });

      it.each`
        channel         | expected
        ${null}         | ${true}
        ${undefined}    | ${true}
        ${''}           | ${true}
        ${'  '}         | ${false}
        ${'production'} | ${false}
      `('channel "$channel" → $expected (whitespace-only channel is not development)', ({ channel, expected }) => {
        // arrange
        jest.replaceProperty(Updates, 'channel', channel);

        // act & assert
        expect(isDevelopment()).toBe(expected);
      });
    });

    it('validateGetRandomValues is true when crypto is available', () => {
      expect(validateGetRandomValues()).toBe(true);
    });
  });
});

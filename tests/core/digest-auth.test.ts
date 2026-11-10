import { md5 } from '@noble/hashes/legacy.js';
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils.js';
import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { DigestAuth, axiosInstance } from '@lib';
import { getMockLogger } from './core-test.utils';

const mockLogger = getMockLogger();
const adapter = jest.fn();

const hash = (value: string) => bytesToHex(md5(utf8ToBytes(value)));

const okResponse = (config: InternalAxiosRequestConfig, data: unknown = 'ok'): AxiosResponse => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config,
});

const unauthorized = (config: InternalAxiosRequestConfig, wwwAuthenticate?: string) =>
  new AxiosError(
    'Request failed with status code 401',
    'ERR_BAD_REQUEST',
    config,
    {},
    {
      data: '',
      status: 401,
      statusText: 'Unauthorized',
      headers: wwwAuthenticate ? { 'www-authenticate': wwwAuthenticate } : {},
      config,
    }
  );

const DIGEST_CHALLENGE = 'Digest realm="cam", nonce="abc123", qop="auth", opaque="op42", algorithm=MD5';

const parseDigestHeader = (header: string): Record<string, string> => {
  const params: Record<string, string> = {};
  for (const [, key, quoted, bare] of header.replace(/^Digest /, '').matchAll(/(\w+)=(?:"([^"]*)"|([^,]+))/g)) {
    params[key] = quoted ?? bare.trim();
  }
  return params;
};

const expectedResponseHash = (params: Record<string, string>, method: string, password = 'pw') => {
  const ha1 = hash(`${params.username}:${params.realm}:${password}`);
  const ha2 = hash(`${method}:${params.uri}`);
  return hash(`${ha1}:${params.nonce}:${params.nc}:${params.cnonce}:${params.qop}:${ha2}`);
};

describe('DigestAuth', () => {
  beforeAll(() => {
    axiosInstance.defaults.adapter = adapter;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    adapter.mockReset();
  });

  it('returns the first response when no challenge is needed', async () => {
    // arrange
    adapter.mockImplementation(async (config) => okResponse(config, { a: 1 }));
    const auth = new DigestAuth({ username: 'u', password: 'pw' });

    // act
    const response = (await auth.request({ url: 'http://host/x', method: 'get' })) as AxiosResponse;

    // assert
    expect(response.data).toEqual({ a: 1 });
    expect(adapter).toHaveBeenCalledTimes(1);
  });

  it('answers a Digest challenge with a 2nd request carrying a valid Authorization header', async () => {
    // arrange
    adapter
      .mockImplementationOnce(async (config) => {
        throw unauthorized(config, DIGEST_CHALLENGE);
      })
      .mockImplementationOnce(async (config) => okResponse(config, 'second'));
    const auth = new DigestAuth({ username: 'u', password: 'pw' });

    // act
    const response = (await auth.request({
      url: 'http://user:secret@host/path/img.jpg?size=1',
      method: 'get',
      headers: { 'X-Custom': '1' },
    })) as AxiosResponse;

    // assert
    expect(response.data).toBe('second');
    const secondConfig = adapter.mock.calls[1][0] as InternalAxiosRequestConfig;
    expect(secondConfig.headers['X-Custom']).toBe('1');
    const header = String(secondConfig.headers.Authorization);
    const params = parseDigestHeader(header);
    expect(params).toEqual(
      expect.objectContaining({
        username: 'u',
        realm: 'cam',
        nonce: 'abc123',
        uri: '/path/img.jpg?size=1',
        algorithm: 'MD5',
        qop: 'auth',
        nc: '00000001',
        opaque: 'op42',
      })
    );
    expect(params.cnonce).toMatch(/^[0-9a-f]{16}$/);
    expect(params.response).toBe(expectedResponseHash(params, 'GET'));
    expect(header).toMatch(
      /^Digest username="u", realm="cam", nonce="abc123", uri="\/path\/img.jpg\?size=1", algorithm=MD5, response="[0-9a-f]{32}", qop=auth, nc=00000001, cnonce="[0-9a-f]{16}", opaque="op42"$/
    );
    expect(mockLogger.debug).toHaveBeenCalledWith('[DigestAuth] GET: http://host/path/img.jpg?size=1');
  });

  it('returns the Authorization header value instead of emitting a 2nd request when disabled', async () => {
    // arrange
    adapter.mockImplementation(async (config) => {
      throw unauthorized(config, 'Digest realm="cam", nonce="n1"');
    });
    const auth = new DigestAuth({ username: 'u', password: 'pw', shouldEmit2ndRequest: false });

    // act
    const header = (await auth.request({ url: '/relative/path' })) as string;

    // assert
    expect(adapter).toHaveBeenCalledTimes(1);
    const params = parseDigestHeader(header);
    expect(params.uri).toBe('/relative/path');
    expect(params.algorithm).toBe('MD5');
    expect(params.qop).toBe('auth');
    expect(params.opaque).toBeUndefined();
    expect(header).not.toContain('opaque');
    expect(params.response).toBe(expectedResponseHash(params, 'GET'));
  });

  it('keeps a server-provided algorithm and qop', async () => {
    // arrange
    adapter.mockImplementation(async (config) => {
      throw unauthorized(config, 'Digest realm="r", nonce="n", qop="auth-int", algorithm=MD5-sess');
    });
    const auth = new DigestAuth({ username: 'u', password: 'pw', shouldEmit2ndRequest: false });

    // act
    const header = (await auth.request({ url: '/p', method: 'post' })) as string;

    // assert
    const params = parseDigestHeader(header);
    expect(params.algorithm).toBe('MD5-sess');
    expect(params.qop).toBe('auth-int');
    expect(params.response).toBe(expectedResponseHash(params, 'POST'));
  });

  it('falls back to GET in the hash for a whitespace-only method', async () => {
    // arrange
    adapter.mockImplementation(async (config) => {
      throw unauthorized(config, 'Digest realm="r", nonce="n"');
    });
    const auth = new DigestAuth({ username: 'u', password: 'pw', shouldEmit2ndRequest: false });

    // act
    const header = (await auth.request({ url: '/p', method: '  ' as never })) as string;

    // assert
    const params = parseDigestHeader(header);
    expect(params.response).toBe(expectedResponseHash(params, 'GET'));
    expect(params.response).not.toBe(expectedResponseHash(params, '  '));
  });

  it('increments nc for the same nonce and resets it for a new nonce', async () => {
    // arrange
    adapter
      .mockImplementationOnce(async (config) => {
        throw unauthorized(config, 'Digest realm="r", nonce="n1"');
      })
      .mockImplementationOnce(async (config) => {
        throw unauthorized(config, 'Digest realm="r", nonce="n1"');
      })
      .mockImplementationOnce(async (config) => {
        throw unauthorized(config, 'Digest realm="r", nonce="n2"');
      });
    const auth = new DigestAuth({ username: 'u', password: 'pw', shouldEmit2ndRequest: false });

    // act
    const first = parseDigestHeader((await auth.request({ url: '/p' })) as string);
    const second = parseDigestHeader((await auth.request({ url: '/p' })) as string);
    const third = parseDigestHeader((await auth.request({ url: '/p' })) as string);

    // assert
    expect([first.nc, second.nc, third.nc]).toEqual(['00000001', '00000002', '00000001']);
    expect(third.nonce).toBe('n2');
  });

  it('throws when the challenge has no realm', async () => {
    // arrange
    adapter.mockImplementation(async (config) => {
      throw unauthorized(config, 'Digest nonce="n"');
    });
    const auth = new DigestAuth({ username: 'u', password: 'pw' });

    // act & assert
    await expect(auth.request({ url: '/p' })).rejects.toThrow('Failed to parse authentication headers');
  });

  it('throws when stale=true clears the nonce', async () => {
    // arrange
    adapter.mockImplementation(async (config) => {
      throw unauthorized(config, 'Digest realm="r", nonce="n", stale=true');
    });
    const auth = new DigestAuth({ username: 'u', password: 'pw' });

    // act & assert
    await expect(auth.request({ url: '/p' })).rejects.toThrow('Failed to parse authentication headers');
  });

  it('throws when the challenge has a whitespace-only realm', async () => {
    // arrange
    adapter.mockImplementation(async (config) => {
      throw unauthorized(config, 'Digest realm="  ", nonce="n"');
    });
    const auth = new DigestAuth({ username: 'u', password: 'pw', shouldEmit2ndRequest: false });

    // act & assert
    await expect(auth.request({ url: '/p' })).rejects.toThrow('Failed to parse authentication headers');
  });

  it.each`
    case                     | wwwAuthenticate
    ${'no challenge header'} | ${undefined}
    ${'a Basic challenge'}   | ${'Basic realm="r"'}
  `('rethrows a 401 with $case and logs it as info', async ({ wwwAuthenticate }) => {
    // arrange
    let thrown: unknown;
    adapter.mockImplementation(async (config) => {
      thrown = unauthorized(config, wwwAuthenticate);
      throw thrown;
    });
    const auth = new DigestAuth({ username: 'u', password: 'pw' });

    // act
    const error = await auth.request({ url: '/p' }).catch((e: unknown) => e);

    // assert
    expect(error).toBe(thrown);
    expect(mockLogger.info).toHaveBeenCalledWith(
      '[DigestAuth] error received. Axios error code: "ERR_BAD_REQUEST" status: "401"'
    );
  });

  it('rethrows an AxiosError without response through the "error received" path', async () => {
    // arrange
    adapter.mockImplementation(async (config) => {
      throw new AxiosError('Network Error', 'ERR_NETWORK', config, {});
    });
    const auth = new DigestAuth({ username: 'u', password: 'pw' });

    // act
    const error = (await auth.request({ url: '/p' }).catch((e: unknown) => e)) as AxiosError;

    // assert
    expect(error.code).toBe('ERR_NETWORK');
    expect(mockLogger.info).toHaveBeenCalledWith(
      '[DigestAuth] error received. Axios error code: "ERR_NETWORK" status: "undefined"'
    );
  });

  it('rethrows an error whose response key is explicitly undefined and logs "no response"', async () => {
    // arrange
    const noResponseError = Object.assign(new Error('aborted'), { code: 'ECONNABORTED', response: undefined });
    adapter.mockImplementation(async () => {
      throw noResponseError;
    });
    const auth = new DigestAuth({ username: 'u', password: 'pw' });

    // act
    const error = await auth.request({ url: '/p' }).catch((e: unknown) => e);

    // assert
    expect(error).toBe(noResponseError);
    expect(mockLogger.info).toHaveBeenCalledWith('[DigestAuth] no response. Axios error code: "ECONNABORTED"');
    expect(mockLogger.info).not.toHaveBeenCalledWith(expect.stringContaining('error received'));
  });

  it('throws when crypto.getRandomValues is unavailable', async () => {
    // arrange
    const original = globalThis.crypto.getRandomValues;
    Object.defineProperty(globalThis.crypto, 'getRandomValues', { value: undefined, configurable: true });
    adapter.mockImplementation(async (config) => {
      throw unauthorized(config, 'Digest realm="r", nonce="n"');
    });
    const auth = new DigestAuth({ username: 'u', password: 'pw' });

    try {
      // act & assert
      await expect(auth.request({ url: '/p' })).rejects.toThrow('[DigestAuth] crypto.getRandomValues is not available');
      expect(mockLogger.error).toHaveBeenCalled();
    } finally {
      Object.defineProperty(globalThis.crypto, 'getRandomValues', { value: original, configurable: true });
    }
  });
});

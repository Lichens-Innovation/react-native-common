import { isBlank } from '@lichens-innovation/ts-common';
import { md5 } from '@noble/hashes/legacy.js';
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils.js';
import { AxiosRequestConfig } from 'axios';
import { produce } from 'immer';
import { logger } from '../../logger/logger';
import { sanitizeUrl } from '../../logger/logger.utils';
import axiosInstance from './axios.config';
import { validateGetRandomValues } from '../device/env.utils';

export interface DigestAuthArgs {
  username: string;
  password: string;
  shouldEmit2ndRequest?: boolean;
}

export interface ReplyToDigestChallengeArgs {
  config: AxiosRequestConfig;
  authHeaderValue: string;
}

interface AxiosLikeErrorResponse {
  status?: number;
}

interface AxiosLikeError {
  code?: string;
  response?: AxiosLikeErrorResponse;
}

export class DigestAuth {
  private username: string;
  private password: string;
  private nonce: string | null = null;
  private realm: string | null = null;
  private qop: string | null = null;
  private opaque: string | null = null;
  private algorithm: string | null = null;
  private nc = 0;

  private shouldEmit2ndRequest = true;

  constructor({ username, password, shouldEmit2ndRequest = true }: DigestAuthArgs) {
    this.username = username;
    this.password = password;
    this.shouldEmit2ndRequest = shouldEmit2ndRequest;
  }

  private md5(str: string): string {
    return bytesToHex(md5(utf8ToBytes(str)));
  }

  private getRandomBytes(length: number): Uint8Array {
    const isOK = validateGetRandomValues();
    if (isOK) {
      return crypto.getRandomValues(new Uint8Array(length));
    } else {
      throw new Error('[DigestAuth] crypto.getRandomValues is not available');
    }
  }

  private generateCNonce(): string {
    const randomBytes = this.getRandomBytes(8);
    return bytesToHex(randomBytes);
  }

  private applyAuthHeaderParam(key: string, value: string): void {
    switch (key) {
      case 'nonce':
        if (this.nonce !== value) {
          this.nonce = value;
          this.nc = 0;
        }
        break;
      case 'realm':
        this.realm = value;
        break;
      case 'qop':
        this.qop = value;
        break;
      case 'opaque':
        this.opaque = value;
        break;
      case 'algorithm':
        this.algorithm = value;
        break;
      case 'stale':
        if (value === 'true') {
          this.nonce = null; // force refresh
          this.nc = 0;
        }
        break;
    }
  }

  private parseAuthHeader(header: string): void {
    const parts = header.match(/(\w+)=("[^"]+"|[^,]+)/g);
    if (!parts) return;

    parts.forEach((part) => {
      const [key, value] = part.split('=');
      const cleanValue = value.replace(/^"|"$/g, '');
      this.applyAuthHeaderParam(key.trim(), cleanValue);
    });

    if (isBlank(this.nonce) || isBlank(this.realm)) {
      throw new Error('Failed to parse authentication headers');
    }
  }

  private extractPathAndQuery(url: string): string {
    try {
      const parsed = new URL(url);
      return parsed.pathname + parsed.search;
    } catch {
      return url;
    }
  }

  private generateAuthHeader(config: AxiosRequestConfig): string {
    if (isBlank(this.nonce) || isBlank(this.realm)) {
      throw new Error('Missing nonce or realm');
    }

    const upperCaseMethod = config.method?.toUpperCase();
    const method = isBlank(upperCaseMethod) ? 'GET' : upperCaseMethod;
    const uri = this.extractPathAndQuery(config.url ?? '');
    const cnonce = this.generateCNonce();
    const ncHex = (++this.nc).toString(16).padStart(8, '0');
    const qop = isBlank(this.qop) ? 'auth' : this.qop;
    const algorithm = isBlank(this.algorithm) ? 'MD5' : this.algorithm;

    const ha1 = this.md5(`${this.username}:${this.realm}:${this.password}`);
    const ha2 = this.md5(`${method}:${uri}`);
    const response = this.md5(`${ha1}:${this.nonce}:${ncHex}:${cnonce}:${qop}:${ha2}`);

    return `Digest username="${this.username}", realm="${this.realm}", nonce="${this.nonce}", uri="${uri}", algorithm=${algorithm}, response="${response}", qop=${qop}, nc=${ncHex}, cnonce="${cnonce}"${this.opaque ? `, opaque="${this.opaque}"` : ''}`;
  }

  async request(config: AxiosRequestConfig): Promise<unknown> {
    try {
      const method = config.method?.toUpperCase() ?? 'GET';
      logger.debug(`[DigestAuth] ${method}: ${sanitizeUrl(config.url)}`);
      const response = await axiosInstance(config);
      logger.debug(`[DigestAuth] response status: ${response.status}`);

      return response;
    } catch (e: unknown) {
      if (this.isNoResponseError(e)) throw e;

      const { authHeader, isDigestChallenge } = this.parseHttpErrorHeaders(e);

      if (!isDigestChallenge) {
        const err = e as AxiosLikeError;
        logger.info(`[DigestAuth] error received. Axios error code: "${err.code}" status: "${err.response?.status}"`);
        throw e;
      }

      logger.debug('[DigestAuth] Received Unauthorized with Digest header challenge.');
      this.parseAuthHeader(authHeader);
      const authHeaderValue = this.generateAuthHeader(config);

      if (this.shouldEmit2ndRequest) {
        return this.replyToDigestChallenge({ config, authHeaderValue });
      } else {
        return authHeaderValue;
      }
    }
  }

  private isNoResponseError(e: unknown): boolean {
    if (typeof e !== 'object' || e === null) return false;
    if (!('code' in e) || !('response' in e)) return false;

    const hasReceivedResponse = e.response !== undefined;
    if (!hasReceivedResponse) {
      logger.info(`[DigestAuth] no response. Axios error code: "${e.code}"`);
    }

    return !hasReceivedResponse;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- error object shape from axios is not typed
  private parseHttpErrorHeaders(e: any) {
    const isUnauthorized = e.response?.status === 401;
    const authHeader = e.response?.headers?.['www-authenticate'];
    const hasDigestHeader = authHeader?.startsWith('Digest');
    const isDigestChallenge = isUnauthorized && hasDigestHeader;

    return { isUnauthorized, authHeader, hasDigestHeader, isDigestChallenge };
  }

  private replyToDigestChallenge({ config, authHeaderValue }: ReplyToDigestChallengeArgs) {
    const newConfig = produce(config, (draft) => {
      const originalHeaders = draft.headers ?? {};
      draft.headers = {
        ...originalHeaders,
        Authorization: authHeaderValue,
      };
    });

    logger.debug(`[DigestAuth] emitting 2nd request with new config for url: ${sanitizeUrl(config.url)}`);
    return axiosInstance(newConfig);
  }
}

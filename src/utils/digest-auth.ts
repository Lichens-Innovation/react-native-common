import { md5 } from '@noble/hashes/legacy.js';
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils.js';
import { AxiosRequestConfig } from 'axios';
import { produce } from 'immer';
import { logger } from '../logger/logger';
import axiosInstance from './axios.config';
import { validateGetRandomValues } from './env.utils';

export interface DigestAuthArgs {
  username: string;
  password: string;
  shouldEmit2ndRequest?: boolean;
}

export interface ReplyToDigestChallengeArgs {
  config: AxiosRequestConfig;
  authHeaderValue: string;
}

export class DigestAuth {
  private username: string;
  private password: string;
  private nonce: string | null = null;
  private realm: string | null = null;
  private qop: string | null = null;
  private opaque: string | null = null;
  private algorithm: string | null = null;
  private nc: number = 0;

  private shouldEmit2ndRequest: boolean = true;

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

  private parseAuthHeader(header: string): void {
    const parts = header.match(/(\w+)=("[^"]+"|[^,]+)/g);
    if (!parts) return;

    parts.forEach((part) => {
      const [key, value] = part.split('=');
      const cleanValue = value.replace(/^"|"$/g, '');
      switch (key.trim()) {
        case 'nonce':
          if (this.nonce !== cleanValue) {
            this.nonce = cleanValue;
            this.nc = 0;
          }
          break;
        case 'realm':
          this.realm = cleanValue;
          break;
        case 'qop':
          this.qop = cleanValue;
          break;
        case 'opaque':
          this.opaque = cleanValue;
          break;
        case 'algorithm':
          this.algorithm = cleanValue;
          break;
        case 'stale':
          if (cleanValue === 'true') {
            this.nonce = null; // force refresh
            this.nc = 0;
          }
          break;
      }
    });

    if (!this.nonce || !this.realm) {
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
    if (!this.nonce || !this.realm) {
      throw new Error('Missing nonce or realm');
    }

    const method = config.method?.toUpperCase() || 'GET';
    const uri = this.extractPathAndQuery(config.url || '');
    const cnonce = this.generateCNonce();
    const ncHex = (++this.nc).toString(16).padStart(8, '0');
    const qop = this.qop || 'auth';

    const ha1 = this.md5(`${this.username}:${this.realm}:${this.password}`);
    const ha2 = this.md5(`${method}:${uri}`);
    const response = this.md5(`${ha1}:${this.nonce}:${ncHex}:${cnonce}:${qop}:${ha2}`);

    return `Digest username="${this.username}", realm="${this.realm}", nonce="${this.nonce}", uri="${uri}", algorithm=${this.algorithm || 'MD5'}, response="${response}", qop=${qop}, nc=${ncHex}, cnonce="${cnonce}"${this.opaque ? `, opaque="${this.opaque}"` : ''}`;
  }

  async request(config: AxiosRequestConfig): Promise<any> {
    try {
      const method = config.method?.toUpperCase() ?? 'GET';
      logger.debug(`[DigestAuth] ${method}: ${config.url}`);
      const response = await axiosInstance(config);
      logger.debug(`[DigestAuth] response status: ${response.status}`);

      return response;
    } catch (e: any) {
      this.handleNoResponseError(e);

      const { authHeader, isDigestChallenge } = this.parseHttpErrorHeaders(e);

      if (!isDigestChallenge) {
        logger.error(`[DigestAuth] error received. Axios error code: "${e.code}" status: "${e.response?.status}"`);
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

  private handleNoResponseError(e: any) {
    const hasReceivedResponse = e.response !== undefined;
    if (!hasReceivedResponse) {
      logger.error(`[DigestAuth] no response. Axios error code: "${e.code}"`);
      throw e;
    }
  }

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

    logger.debug(`[DigestAuth] emitting 2nd request with new config for url: ${config.url}`);
    return axiosInstance(newConfig);
  }
}

import { md5 } from '@noble/hashes/legacy';
import { bytesToHex } from '@noble/hashes/utils';
import { produce } from 'immer';
import { logger } from '../logger/logger';
import axiosInstance from './axios.config';
import { validateGetRandomValues } from './env.utils';
export class DigestAuth {
    constructor({ username, password, shouldEmit2ndRequest = true }) {
        this.nonce = null;
        this.realm = null;
        this.qop = null;
        this.opaque = null;
        this.algorithm = null;
        this.nc = 0;
        this.shouldEmit2ndRequest = true;
        this.username = username;
        this.password = password;
        this.shouldEmit2ndRequest = shouldEmit2ndRequest;
    }
    md5(str) {
        return bytesToHex(md5(str));
    }
    getRandomBytes(length) {
        const isOK = validateGetRandomValues();
        if (isOK) {
            return crypto.getRandomValues(new Uint8Array(length));
        }
        else {
            throw new Error('[DigestAuth] crypto.getRandomValues is not available');
        }
    }
    generateCNonce() {
        const randomBytes = this.getRandomBytes(8);
        return bytesToHex(randomBytes);
    }
    parseAuthHeader(header) {
        const parts = header.match(/(\w+)=("[^"]+"|[^,]+)/g);
        if (!parts)
            return;
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
    extractPathAndQuery(url) {
        try {
            const parsed = new URL(url);
            return parsed.pathname + parsed.search;
        }
        catch (_a) {
            return url;
        }
    }
    generateAuthHeader(config) {
        var _a;
        if (!this.nonce || !this.realm) {
            throw new Error('Missing nonce or realm');
        }
        const method = ((_a = config.method) === null || _a === void 0 ? void 0 : _a.toUpperCase()) || 'GET';
        const uri = this.extractPathAndQuery(config.url || '');
        const cnonce = this.generateCNonce();
        const ncHex = (++this.nc).toString(16).padStart(8, '0');
        const qop = this.qop || 'auth';
        const ha1 = this.md5(`${this.username}:${this.realm}:${this.password}`);
        const ha2 = this.md5(`${method}:${uri}`);
        const response = this.md5(`${ha1}:${this.nonce}:${ncHex}:${cnonce}:${qop}:${ha2}`);
        return `Digest username="${this.username}", realm="${this.realm}", nonce="${this.nonce}", uri="${uri}", algorithm=${this.algorithm || 'MD5'}, response="${response}", qop=${qop}, nc=${ncHex}, cnonce="${cnonce}"${this.opaque ? `, opaque="${this.opaque}"` : ''}`;
    }
    async request(config) {
        var _a, _b, _c;
        try {
            const method = (_b = (_a = config.method) === null || _a === void 0 ? void 0 : _a.toUpperCase()) !== null && _b !== void 0 ? _b : 'GET';
            logger.debug(`[DigestAuth] ${method}: ${config.url}`);
            const response = await axiosInstance(config);
            logger.debug(`[DigestAuth] response status: ${response.status}`);
            return response;
        }
        catch (e) {
            this.handleNoResponseError(e);
            const { authHeader, isDigestChallenge } = this.parseHttpErrorHeaders(e);
            if (!isDigestChallenge) {
                logger.error(`[DigestAuth] error received. Axios error code: "${e.code}" status: "${(_c = e.response) === null || _c === void 0 ? void 0 : _c.status}"`);
                throw e;
            }
            logger.debug('[DigestAuth] Received Unauthorized with Digest header challenge.');
            this.parseAuthHeader(authHeader);
            const authHeaderValue = this.generateAuthHeader(config);
            if (this.shouldEmit2ndRequest) {
                return this.replyToDigestChallenge({ config, authHeaderValue });
            }
            else {
                return authHeaderValue;
            }
        }
    }
    handleNoResponseError(e) {
        const hasReceivedResponse = e.response !== undefined;
        if (!hasReceivedResponse) {
            logger.error(`[DigestAuth] no response. Axios error code: "${e.code}"`);
            throw e;
        }
    }
    parseHttpErrorHeaders(e) {
        var _a, _b, _c;
        const isUnauthorized = ((_a = e.response) === null || _a === void 0 ? void 0 : _a.status) === 401;
        const authHeader = (_c = (_b = e.response) === null || _b === void 0 ? void 0 : _b.headers) === null || _c === void 0 ? void 0 : _c['www-authenticate'];
        const hasDigestHeader = authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith('Digest');
        const isDigestChallenge = isUnauthorized && hasDigestHeader;
        return { isUnauthorized, authHeader, hasDigestHeader, isDigestChallenge };
    }
    replyToDigestChallenge({ config, authHeaderValue }) {
        const newConfig = produce(config, (draft) => {
            var _a;
            const originalHeaders = (_a = draft.headers) !== null && _a !== void 0 ? _a : {};
            draft.headers = Object.assign(Object.assign({}, originalHeaders), { Authorization: authHeaderValue });
        });
        logger.debug(`[DigestAuth] emitting 2nd request with new config for url: ${config.url}`);
        return axiosInstance(newConfig);
    }
}
//# sourceMappingURL=digest-auth.js.map
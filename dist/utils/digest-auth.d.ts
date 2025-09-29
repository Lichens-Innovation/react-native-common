import { AxiosRequestConfig } from 'axios';
export interface DigestAuthArgs {
    username: string;
    password: string;
    shouldEmit2ndRequest?: boolean;
}
export interface ReplyToDigestChallengeArgs {
    config: AxiosRequestConfig;
    authHeaderValue: string;
}
export declare class DigestAuth {
    private username;
    private password;
    private nonce;
    private realm;
    private qop;
    private opaque;
    private algorithm;
    private nc;
    private shouldEmit2ndRequest;
    constructor({ username, password, shouldEmit2ndRequest }: DigestAuthArgs);
    private md5;
    private getRandomBytes;
    private generateCNonce;
    private parseAuthHeader;
    private extractPathAndQuery;
    private generateAuthHeader;
    request(config: AxiosRequestConfig): Promise<any>;
    private handleNoResponseError;
    private parseHttpErrorHeaders;
    private replyToDigestChallenge;
}

import { Buffer } from 'buffer';
export const base64Encode = (text) => {
    return Buffer.from(text).toString('base64');
};
export const base64Decode = (base64) => {
    return Buffer.from(base64, 'base64').toString('utf-8');
};
//# sourceMappingURL=base64.utils.js.map
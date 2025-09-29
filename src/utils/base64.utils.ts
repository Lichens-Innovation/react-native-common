import { Buffer } from 'buffer';

export const base64Encode = (text: string): string => {
  return Buffer.from(text).toString('base64');
};

export const base64Decode = (base64: string): string => {
  return Buffer.from(base64, 'base64').toString('utf-8');
};

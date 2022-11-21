import * as crypto from 'crypto';
import { exposeInMainWorld } from '../main/exposeInMainWorld';

function encodeBase64(input: string) {
  return Buffer.from(input).toString('base64');
}

function decodeBase64(base64: string) {
  return Buffer.from(base64, 'base64').toString();
}

function md5(input: string) {
  return crypto.createHash('md5').update(input).digest('hex');
}

// Export for types in contracts.d.ts
export const nodeCrypto = { encodeBase64, decodeBase64, md5 } as const;

exposeInMainWorld('nodeCrypto', nodeCrypto);

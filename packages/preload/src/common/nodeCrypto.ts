import { exposeInMainWorld } from '../main/exposeInMainWorld';

function encodeBase64(input: string) {
  return Buffer.from(input).toString('base64');
}

function decodeBase64(base64: string) {
  return Buffer.from(base64, 'base64').toString();
}

// Export for types in contracts.d.ts
export const nodeCrypto = { encodeBase64, decodeBase64 } as const;

exposeInMainWorld('nodeCrypto', nodeCrypto);

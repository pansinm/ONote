export const blobToBuffer = async (blob: Blob) => {
  return new Uint8Array(await blob.arrayBuffer()) as Buffer;
};

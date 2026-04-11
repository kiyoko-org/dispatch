import * as FileSystem from 'expo-file-system';
import type {
  DispatchClient,
  VerificationDocumentSide,
} from '@kiyoko-org/dispatch-lib';

export type LocalVerificationFile = {
  uri: string;
  mimeType: string;
  sizeBytes: number;
  name?: string | null;
};

export async function uploadVerificationFile({
  client,
  profileId,
  requestId,
  side,
  file,
}: {
  client: DispatchClient;
  profileId: string;
  requestId: string;
  side: VerificationDocumentSide;
  file: LocalVerificationFile;
}): Promise<string> {
  const fileBody = await fileUriToUploadBody(file.uri, file.mimeType);
  const { error, path } = await client.uploadVerificationDocument({
    fileBody,
    fileSizeBytes: file.sizeBytes,
    mimeType: file.mimeType,
    profileId,
    requestId,
    side,
  });

  if (error) {
    throw new Error(error.message);
  }

  return path;
}

export async function uploadVerificationDocuments({
  client,
  profileId,
  requestId,
  frontFile,
  backFile,
}: {
  client: DispatchClient;
  profileId: string;
  requestId: string;
  frontFile: LocalVerificationFile;
  backFile?: LocalVerificationFile | null;
}): Promise<{ frontStoragePath: string; backStoragePath: string | null }> {
  const frontStoragePath = await uploadVerificationFile({
    client,
    profileId,
    requestId,
    side: 'front',
    file: frontFile,
  });

  if (!backFile) {
    return { frontStoragePath, backStoragePath: null };
  }

  const backStoragePath = await uploadVerificationFile({
    client,
    profileId,
    requestId,
    side: 'back',
    file: backFile,
  });

  return { frontStoragePath, backStoragePath };
}

async function fileUriToUploadBody(
  fileUri: string,
  mimeType: string,
): Promise<Blob | Uint8Array> {
  const base64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const bytes = base64ToUint8Array(base64);

  if (typeof Blob !== 'undefined') {
    try {
      return new Blob([bytes], { type: mimeType });
    } catch {
      return bytes;
    }
  }

  return bytes;
}

function base64ToUint8Array(base64: string): Uint8Array {
  const cleaned = base64.replace(/^data:.*;base64,/, '').replace(/[^A-Za-z0-9+/=]/g, '');
  if (!cleaned) return new Uint8Array(0);

  if (typeof globalThis.atob === 'function') {
    const binary = globalThis.atob(cleaned);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    return bytes;
  }

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lookup = new Uint8Array(256);
  for (let index = 0; index < lookup.length; index += 1) lookup[index] = 255;
  for (let index = 0; index < chars.length; index += 1) {
    lookup[chars.charCodeAt(index)] = index;
  }
  lookup['='.charCodeAt(0)] = 0;

  const padding = cleaned.endsWith('==') ? 2 : cleaned.endsWith('=') ? 1 : 0;
  const bytesLength = Math.floor((cleaned.length * 3) / 4) - padding;
  const bytes = new Uint8Array(bytesLength);

  let byteIndex = 0;
  for (let index = 0; index < cleaned.length; index += 4) {
    const a = lookup[cleaned.charCodeAt(index)];
    const b = lookup[cleaned.charCodeAt(index + 1)];
    const c = lookup[cleaned.charCodeAt(index + 2)];
    const d = lookup[cleaned.charCodeAt(index + 3)];
    const triple = (a << 18) | (b << 12) | (c << 6) | d;

    if (byteIndex < bytesLength) bytes[byteIndex++] = (triple >> 16) & 0xff;
    if (byteIndex < bytesLength) bytes[byteIndex++] = (triple >> 8) & 0xff;
    if (byteIndex < bytesLength) bytes[byteIndex++] = triple & 0xff;
  }

  return bytes;
}

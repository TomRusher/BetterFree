import type { AppState, PinConfig } from '../types/app';
import { migrateLegacyState } from './stateLogic';

const PBKDF2_ITERATIONS = 100000;

export class BackupCryptoError extends Error {
  readonly code: 'INVALID_FORMAT' | 'WRONG_PASSPHRASE' | 'CRYPTO_UNAVAILABLE';
  constructor(code: 'INVALID_FORMAT' | 'WRONG_PASSPHRASE' | 'CRYPTO_UNAVAILABLE', message: string) {
    super(message);
    this.code = code;
  }
}

function getSubtle(): SubtleCrypto {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new BackupCryptoError('CRYPTO_UNAVAILABLE', 'Web Crypto API is unavailable');
  }
  return subtle;
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function fromBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function randomBytes(length: number): Uint8Array {
  const arr = new Uint8Array(length);
  globalThis.crypto.getRandomValues(arr);
  return arr;
}

async function deriveKeyBits(secret: string, salt: Uint8Array): Promise<ArrayBuffer> {
  const subtle = getSubtle();
  const enc = new TextEncoder();
  const keyMaterial = await subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  return subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );
}

async function deriveAesKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const subtle = getSubtle();
  const enc = new TextEncoder();
  const keyMaterial = await subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function createPinConfig(pin: string): Promise<PinConfig> {
  const saltBytes = randomBytes(16);
  const bits = await deriveKeyBits(pin, saltBytes);
  return {
    enabled: true,
    salt: toBase64(saltBytes),
    hash: toBase64(new Uint8Array(bits)),
  };
}

export async function verifyPin(pin: string, config: PinConfig): Promise<boolean> {
  if (!config.enabled || !config.salt || !config.hash) return true;
  try {
    const saltBytes = fromBase64(config.salt);
    const bits = await deriveKeyBits(pin, saltBytes);
    const candidate = toBase64(new Uint8Array(bits));
    if (candidate.length !== config.hash.length) return false;
    let diff = 0;
    for (let i = 0; i < candidate.length; i++) {
      diff |= candidate.charCodeAt(i) ^ config.hash.charCodeAt(i);
    }
    return diff === 0;
  } catch {
    return false;
  }
}

export interface EncryptedBackupEnvelope {
  format: 'betterfree-encrypted-backup';
  version: 1;
  createdAt: string;
  salt: string;
  iv: string;
  ciphertext: string;
}

export async function encryptBackup(state: AppState, passphrase: string): Promise<string> {
  if (!passphrase || passphrase.length < 4) {
    throw new BackupCryptoError('WRONG_PASSPHRASE', 'Passphrase must be at least 4 characters');
  }
  const subtle = getSubtle();
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const aesKey = await deriveAesKey(passphrase, salt);
  // Strip local PIN hash so restored device lets user set or retain their own lock cleanly
  const exportPayload: AppState = {
    ...state,
    pin: { enabled: false, salt: '', hash: '' },
  };
  const encoded = new TextEncoder().encode(JSON.stringify(exportPayload));
  const encrypted = await subtle.encrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    aesKey,
    encoded
  );
  const envelope: EncryptedBackupEnvelope = {
    format: 'betterfree-encrypted-backup',
    version: 1,
    createdAt: new Date().toISOString(),
    salt: toBase64(salt),
    iv: toBase64(iv),
    ciphertext: toBase64(new Uint8Array(encrypted)),
  };
  return JSON.stringify(envelope, null, 2);
}

export async function decryptBackup(rawJson: string, passphrase: string): Promise<AppState> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    throw new BackupCryptoError('INVALID_FORMAT', 'Backup file is not valid JSON');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new BackupCryptoError('INVALID_FORMAT', 'Invalid backup structure');
  }

  const env = parsed as Partial<EncryptedBackupEnvelope>;
  if (
    env.format !== 'betterfree-encrypted-backup' ||
    env.version !== 1 ||
    typeof env.salt !== 'string' ||
    typeof env.iv !== 'string' ||
    typeof env.ciphertext !== 'string'
  ) {
    throw new BackupCryptoError('INVALID_FORMAT', 'Unrecognized BetterFree backup format');
  }

  const subtle = getSubtle();
  try {
    const salt = fromBase64(env.salt);
    const iv = fromBase64(env.iv);
    const cipher = fromBase64(env.ciphertext);
    const aesKey = await deriveAesKey(passphrase, salt);
    const plainBuf = await subtle.decrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      aesKey,
      cipher as BufferSource
    );
    const plainJson = new TextDecoder().decode(plainBuf);
    const data = JSON.parse(plainJson);
    return migrateLegacyState(data);
  } catch (err) {
    if (err instanceof BackupCryptoError) throw err;
    throw new BackupCryptoError('WRONG_PASSPHRASE', 'Incorrect passphrase or corrupted backup');
  }
}

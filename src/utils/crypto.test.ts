import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BackupCryptoError,
  createPinConfig,
  decryptBackup,
  encryptBackup,
  verifyPin,
} from './crypto';
import { createDefaultState } from './stateLogic';

test('PIN hash creation and verification succeeds for right PIN and rejects wrong PIN', async () => {
  const pinConfig = await createPinConfig('2580');
  assert.equal(pinConfig.enabled, true);
  assert.ok(pinConfig.salt.length > 0);
  assert.ok(pinConfig.hash.length > 0);

  assert.equal(await verifyPin('2580', pinConfig), true);
  assert.equal(await verifyPin('9999', pinConfig), false);
});

test('encryptBackup and decryptBackup round-trip state securely and reject wrong passphrase', async () => {
  const state = createDefaultState('cs');
  state.onboardingDone = true;
  state.ageConfirmed18 = true;
  state.reasons = ['Jasná mysl a energie'];
  state.ifThenPlan = 'Když přijde večerní nuda, tak nechám telefon v kuchyni.';
  state.pin = await createPinConfig('1234');

  const encrypted = await encryptBackup(state, 'tajne-heslo-2026');
  const parsed = JSON.parse(encrypted);
  assert.equal(parsed.format, 'betterfree-encrypted-backup');
  assert.ok(typeof parsed.ciphertext === 'string');

  const restored = await decryptBackup(encrypted, 'tajne-heslo-2026');
  assert.deepEqual(restored.reasons, ['Jasná mysl a energie']);
  assert.equal(restored.ifThenPlan, 'Když přijde večerní nuda, tak nechám telefon v kuchyni.');
  // PIN is reset on restore so user configures lock on destination device
  assert.equal(restored.pin.enabled, false);

  await assert.rejects(
    () => decryptBackup(encrypted, 'spatne-heslo'),
    (err: unknown) => err instanceof BackupCryptoError && err.code === 'WRONG_PASSPHRASE'
  );
});

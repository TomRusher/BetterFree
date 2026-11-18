import React, { useRef, useState } from 'react';
import { Download, Lock, Shield, Upload, X } from 'lucide-react';
import type { AppState, Lang, PinConfig } from '../types/app';
import { PRIVACY_SECTIONS } from '../data/content';
import { tr, UI } from '../data/uiStrings';
import { BackupCryptoError, createPinConfig, decryptBackup, encryptBackup } from '../utils/crypto';
import { PWAInstallControl } from './PWAInstallControl';

interface SettingsSheetProps {
  state: AppState;
  onClose: () => void;
  onToggleMilestones: () => void;
  onChangeLang: (lang: Lang) => void;
  onSetPin: (pin: PinConfig) => void;
  onLockNow: () => void;
  onImportState: (restored: AppState) => void;
  onOpenCrisis: () => void;
  onWipeAll: () => void;
}

export const SettingsSheet: React.FC<SettingsSheetProps> = ({
  state,
  onClose,
  onToggleMilestones,
  onChangeLang,
  onSetPin,
  onLockNow,
  onImportState,
  onOpenCrisis,
  onWipeAll,
}) => {
  const lang = state.lang;

  // PIN management
  const [newPin, setNewPin] = useState('');
  const [pinMsg, setPinMsg] = useState<string | null>(null);

  // Backup state
  const [passphrase, setPassphrase] = useState('');
  const [backupStatus, setBackupStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sub-sections
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [supportClicked, setSupportClicked] = useState(false);
  const [confirmWipe, setConfirmWipe] = useState(false);

  const handleEnablePin = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newPin.trim();
    if (!/^\d{4,6}$/.test(clean)) {
      setPinMsg(lang === 'cs' ? 'Zadej 4 až 6 číslic.' : 'Enter 4 to 6 digits.');
      return;
    }
    const cfg = await createPinConfig(clean);
    onSetPin(cfg);
    setNewPin('');
    setPinMsg(lang === 'cs' ? 'PIN zámek byl zapnut.' : 'PIN lock enabled.');
  };

  const handleDisablePin = () => {
    onSetPin({ enabled: false, salt: '', hash: '' });
    setPinMsg(lang === 'cs' ? 'PIN zámek byl vypnut.' : 'PIN lock disabled.');
  };

  const handleExport = async () => {
    if (passphrase.length < 4) {
      setBackupStatus(
        lang === 'cs'
          ? 'Zadej heslo alespoň se 4 znaky.'
          : 'Enter a passphrase with at least 4 characters.'
      );
      return;
    }
    try {
      const payload = await encryptBackup(state, passphrase);
      const blob = new Blob([payload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `betterfree-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setBackupStatus(lang === 'cs' ? 'Šifrovaná záloha stažena.' : 'Encrypted backup downloaded.');
    } catch {
      setBackupStatus(lang === 'cs' ? 'Export se nezdařil.' : 'Export failed.');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (passphrase.length < 4) {
      setBackupStatus(
        lang === 'cs'
          ? 'Nejprve vyplň heslo k šifrované záloze.'
          : 'Enter the backup passphrase first.'
      );
      return;
    }
    try {
      const text = await file.text();
      const restored = await decryptBackup(text, passphrase);
      onImportState(restored);
      setBackupStatus(lang === 'cs' ? 'Záloha úspěšně obnovena.' : 'Backup restored successfully.');
    } catch (err) {
      if (err instanceof BackupCryptoError && err.code === 'WRONG_PASSPHRASE') {
        setBackupStatus(lang === 'cs' ? 'Nesprávné heslo k záloze.' : 'Incorrect passphrase.');
      } else {
        setBackupStatus(
          lang === 'cs' ? 'Soubor není platná záloha BetterFree.' : 'Invalid BetterFree backup file.'
        );
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#05080D]/80 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={tr(UI.settings.title, lang)}
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-[#1D2638] bg-[#0B0F17] p-5 sm:p-6 space-y-5 pb-safe"
      >
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-semibold text-[#EDE6D8]">{tr(UI.settings.title, lang)}</h1>
          <button
            type="button"
            onClick={onClose}
            aria-label={tr(UI.settings.close, lang)}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl border border-[#1D2638] bg-[#121826] text-[#8892A4] hover:text-[#EDE6D8]"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Display & Language toggles */}
        <div className="rounded-2xl border border-[#1D2638] bg-[#121826] divide-y divide-[#1D2638]">
          <div className="flex items-center justify-between gap-4 p-4">
            <span className="text-sm text-[#EDE6D8]">{tr(UI.settings.showMilestones, lang)}</span>
            <button
              type="button"
              role="switch"
              aria-checked={state.showMilestones}
              aria-label={tr(UI.settings.showMilestones, lang)}
              onClick={onToggleMilestones}
              className={`relative h-8 w-14 rounded-full transition ${
                state.showMilestones ? 'bg-[#8A9A86]' : 'bg-[#27324A]'
              }`}
            >
              <span
                className={`absolute top-1 left-1 h-6 w-6 rounded-full transition-transform ${
                  state.showMilestones
                    ? 'translate-x-6 bg-[#0B0F17]'
                    : 'translate-x-0 bg-[#C9D3E6]'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 p-4">
            <span className="text-sm text-[#EDE6D8]">{tr(UI.settings.language, lang)}</span>
            <div className="inline-flex rounded-xl border border-[#1D2638] bg-[#0B0F17] p-1">
              <button
                type="button"
                onClick={() => onChangeLang('cs')}
                className={`min-h-[36px] rounded-lg px-3.5 text-xs font-medium ${
                  lang === 'cs' ? 'bg-[#1B2540] text-[#9DB4E0]' : 'text-[#8892A4]'
                }`}
              >
                CS
              </button>
              <button
                type="button"
                onClick={() => onChangeLang('en')}
                className={`min-h-[36px] rounded-lg px-3.5 text-xs font-medium ${
                  lang === 'en' ? 'bg-[#1B2540] text-[#9DB4E0]' : 'text-[#8892A4]'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>

        {/* PIN Lock */}
        <section className="rounded-2xl border border-[#1D2638] bg-[#121826] p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-[#9DB4E0]" aria-hidden="true" />
            <h2 className="text-base font-semibold text-[#EDE6D8]">{tr(UI.settings.pinTitle, lang)}</h2>
          </div>
          <p className="text-xs text-[#8892A4] leading-relaxed">{tr(UI.settings.pinDesc, lang)}</p>

          {state.pin.enabled ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onLockNow}
                className="min-h-[44px] flex-1 rounded-xl bg-[#8A9A86] px-4 text-sm font-semibold text-[#0B0F17]"
              >
                {tr(UI.settings.pinLockNowBtn, lang)}
              </button>
              <button
                type="button"
                onClick={handleDisablePin}
                className="min-h-[44px] flex-1 rounded-xl border border-[#2C3A54] bg-[#0F1522] px-4 text-sm font-medium text-[#9DB4E0]"
              >
                {tr(UI.settings.pinDisableBtn, lang)}
              </button>
            </div>
          ) : (
            <form onSubmit={handleEnablePin} className="flex gap-2">
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder={tr(UI.settings.pinSetPlaceholder, lang)}
                aria-label={tr(UI.settings.pinTitle, lang)}
                className="min-h-[44px] flex-1 rounded-xl border border-[#27324A] bg-[#0F1522] px-3.5 font-mono text-sm text-[#EDE6D8]"
              />
              <button
                type="submit"
                className="min-h-[44px] rounded-xl bg-[#8A9A86] px-4 text-sm font-semibold text-[#0B0F17] whitespace-nowrap shrink-0"
              >
                {tr(UI.settings.pinEnableBtn, lang)}
              </button>
            </form>
          )}
          {pinMsg && <p className="text-xs text-[#9DB4E0]">{pinMsg}</p>}
        </section>

        {/* Encrypted Export / Import */}
        <section className="rounded-2xl border border-[#1D2638] bg-[#121826] p-4 space-y-3">
          <h2 className="text-base font-semibold text-[#EDE6D8]">{tr(UI.settings.backupTitle, lang)}</h2>
          <p className="text-xs text-[#8892A4] leading-relaxed">{tr(UI.settings.backupDesc, lang)}</p>

          <input
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            placeholder={tr(UI.settings.backupPassPh, lang)}
            aria-label={tr(UI.settings.backupPassPh, lang)}
            className="min-h-[44px] w-full rounded-xl border border-[#27324A] bg-[#0F1522] px-3.5 text-sm text-[#EDE6D8]"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => void handleExport()}
              className="min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl border border-[#2C3A54] bg-[#0F1522] px-4 text-xs font-medium text-[#9DB4E0] hover:border-[#5C7FB8]"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              {tr(UI.settings.exportBtn, lang)}
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl border border-[#2C3A54] bg-[#0F1522] px-4 text-xs font-medium text-[#9DB4E0] hover:border-[#5C7FB8]"
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              {tr(UI.settings.importBtn, lang)}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={(e) => void handleFileChange(e)}
            className="hidden"
          />
          {backupStatus && <p className="text-xs text-[#9DB4E0]">{backupStatus}</p>}
        </section>

        {/* PWA Install & iPhone Guide */}
        <section className="rounded-2xl border border-[#1D2638] bg-[#121826] p-4 space-y-3">
          <h2 className="text-base font-semibold text-[#EDE6D8]">{tr(UI.settings.pwaTitle, lang)}</h2>
          <PWAInstallControl lang={lang} />
        </section>

        {/* Privacy Policy & Crisis Contacts */}
        <section className="rounded-2xl border border-[#1D2638] bg-[#121826] p-4 space-y-2.5">
          <button
            type="button"
            onClick={() => setShowPrivacy((prev) => !prev)}
            className="min-h-[44px] w-full flex items-center justify-between rounded-xl border border-[#27324A] bg-[#0F1522] px-4 text-sm font-medium text-[#EDE6D8]"
          >
            <span className="inline-flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#8A9A86]" aria-hidden="true" />
              {tr(UI.settings.privacyBtn, lang)}
            </span>
            <span className="text-xs text-[#8892A4]">{showPrivacy ? '−' : '+'}</span>
          </button>

          {showPrivacy && (
            <div className="space-y-3 pt-2 text-xs leading-relaxed text-[#EDE6D8]/90">
              {PRIVACY_SECTIONS.map((sec, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="font-semibold text-[#9DB4E0]">{tr(sec.title, lang)}</div>
                  <p className="text-[#8892A4]">{tr(sec.body, lang)}</p>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenCrisis();
            }}
            className="min-h-[44px] w-full rounded-xl border border-[#27324A] bg-[#0F1522] px-4 text-left text-sm font-medium text-[#9DB4E0] hover:border-[#5C7FB8]"
          >
            {tr(UI.settings.crisisBtn, lang)}
          </button>
        </section>

        {/* Support the Project (kept per user preference) */}
        <section className="rounded-2xl border border-[#1D2638] bg-[#121826] p-4 space-y-3">
          <h2 className="text-base font-semibold text-[#EDE6D8]">
            {tr(UI.settings.supportTitle, lang)}
          </h2>
          <p className="text-xs text-[#8892A4] leading-relaxed">
            {tr(UI.settings.supportBody, lang)}
          </p>
          <button
            type="button"
            onClick={() => setSupportClicked(true)}
            className="min-h-[44px] w-full rounded-xl border border-[#2C3A54] bg-[#0F1522] px-4 text-sm font-medium text-[#EDE6D8] hover:border-[#8A9A86]"
          >
            {supportClicked ? tr(UI.settings.supportPending, lang) : tr(UI.settings.supportBtn, lang)}
          </button>
        </section>

        {/* Calm Wipe All Data */}
        <section className="rounded-2xl border border-[#1D2638] bg-[#121826] p-4 space-y-3">
          <h2 className="text-base font-semibold text-[#EDE6D8]">{tr(UI.settings.wipeTitle, lang)}</h2>
          {!confirmWipe ? (
            <button
              type="button"
              onClick={() => setConfirmWipe(true)}
              className="min-h-[44px] w-full rounded-xl border border-[#2C3A54] bg-[#0F1522] px-4 text-sm font-medium text-[#8892A4] hover:text-[#EDE6D8]"
            >
              {tr(UI.settings.wipeBtn, lang)}
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-[#EDE6D8] leading-relaxed">
                {tr(UI.settings.wipeConfirm, lang)}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmWipe(false)}
                  className="min-h-[44px] flex-1 rounded-xl border border-[#2C3A54] text-xs font-medium text-[#EDE6D8]"
                >
                  {tr(UI.settings.cancel, lang)}
                </button>
                <button
                  type="button"
                  onClick={onWipeAll}
                  className="min-h-[44px] flex-1 rounded-xl border border-[#5C7FB8] bg-[#1B2540] text-xs font-medium text-[#9DB4E0]"
                >
                  {tr(UI.settings.wipeConfirmBtn, lang)}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

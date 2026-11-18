import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import type { Lang, PinConfig } from '../types/app';
import { tr, UI } from '../data/uiStrings';
import { verifyPin } from '../utils/crypto';
import { BrandMark } from './BrandMark';

interface PinLockScreenProps {
  lang: Lang;
  pinConfig: PinConfig;
  onUnlock: () => void;
  onWipeAll: () => void;
}

export const PinLockScreen: React.FC<PinLockScreenProps> = ({
  lang,
  pinConfig,
  onUnlock,
  onWipeAll,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [confirmWipe, setConfirmWipe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;
    const ok = await verifyPin(pin.trim(), pinConfig);
    if (ok) {
      setError(false);
      onUnlock();
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-sm rounded-3xl border border-[#1D2638] bg-[#121826] p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BrandMark size={26} />
            <span className="font-semibold text-[#8A9A86]">BetterFree</span>
          </div>
          <Lock className="h-5 w-5 text-[#9DB4E0]" aria-hidden="true" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold text-[#EDE6D8]">{tr(UI.pinScreen.title, lang)}</h1>
          <p className="text-sm text-[#8892A4]">{tr(UI.pinScreen.sub, lang)}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="pin-unlock-input" className="sr-only">
              PIN
            </label>
            <input
              id="pin-unlock-input"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              maxLength={8}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, ''));
                setError(false);
              }}
              placeholder="••••"
              className="min-h-[52px] w-full rounded-2xl border border-[#27324A] bg-[#0F1522] px-4 text-center font-mono text-2xl tracking-[0.4em] text-[#EDE6D8] placeholder:text-[#8892A4]/50"
            />
            {error && (
              <p role="alert" className="mt-2 text-sm text-[#9DB4E0]">
                {tr(UI.pinScreen.wrong, lang)}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={pin.length < 4}
            className="min-h-[50px] w-full rounded-full bg-[#8A9A86] px-6 text-base font-semibold text-[#0B0F17] transition hover:bg-[#9BAA97] disabled:bg-[#1A2233] disabled:text-[#6B7689]"
          >
            {tr(UI.pinScreen.unlock, lang)}
          </button>
        </form>

        {!confirmWipe ? (
          <button
            type="button"
            onClick={() => setConfirmWipe(true)}
            className="min-h-[44px] w-full text-center text-xs text-[#8892A4] hover:text-[#EDE6D8]"
          >
            {tr(UI.pinScreen.forgot, lang)}
          </button>
        ) : (
          <div className="rounded-2xl border border-[#27324A] bg-[#0F1522] p-4 space-y-3">
            <p className="text-xs leading-relaxed text-[#EDE6D8]">{tr(UI.pinScreen.forgotConfirm, lang)}</p>
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
      </div>
    </div>
  );
};

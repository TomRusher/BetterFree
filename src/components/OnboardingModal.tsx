import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import type { GoalMode, Lang } from '../types/app';
import { tr, UI } from '../data/uiStrings';
import { BrandMark } from './BrandMark';

interface OnboardingModalProps {
  lang: Lang;
  onChangeLang: (lang: Lang) => void;
  onComplete: (payload: {
    goalMode: GoalMode;
    customGoalText: string;
    initialReason: string;
  }) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  lang,
  onChangeLang,
  onComplete,
}) => {
  const [confirmed18, setConfirmed18] = useState(false);
  const [goalMode, setGoalMode] = useState<GoalMode>('stop');
  const [customGoalText, setCustomGoalText] = useState('');
  const [initialReason, setInitialReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmed18) return;
    onComplete({
      goalMode,
      customGoalText: customGoalText.trim(),
      initialReason: initialReason.trim(),
    });
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] px-4 py-8 sm:px-6 flex items-center justify-center">
      <div className="w-full max-w-lg rounded-3xl border border-[#1D2638] bg-[#121826] p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <BrandMark size={28} />
            <span className="font-semibold tracking-tight text-[#8A9A86] text-lg">BetterFree</span>
          </div>
          <div className="inline-flex rounded-xl border border-[#1D2638] bg-[#0B0F17] p-1">
            <button
              type="button"
              onClick={() => onChangeLang('cs')}
              className={`min-h-[36px] rounded-lg px-3 text-xs font-medium transition ${
                lang === 'cs' ? 'bg-[#1B2540] text-[#9DB4E0]' : 'text-[#8892A4] hover:text-[#EDE6D8]'
              }`}
            >
              CS
            </button>
            <button
              type="button"
              onClick={() => onChangeLang('en')}
              className={`min-h-[36px] rounded-lg px-3 text-xs font-medium transition ${
                lang === 'en' ? 'bg-[#1B2540] text-[#9DB4E0]' : 'text-[#8892A4] hover:text-[#EDE6D8]'
              }`}
            >
              EN
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-[#EDE6D8] leading-snug">
            {tr(UI.onboarding.title, lang)}
          </h1>
          <p className="text-[15px] leading-relaxed text-[#8892A4]">
            {tr(UI.onboarding.subtitle, lang)}
          </p>
        </div>

        <div className="rounded-2xl bg-[#0F1522] p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-sm font-medium text-[#9DB4E0]">
            <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{tr(UI.onboarding.disclaimerTitle, lang)}</span>
          </div>
          <p className="text-sm leading-relaxed text-[#EDE6D8]/90">
            {tr(UI.onboarding.disclaimerBody, lang)}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <span className="block text-sm font-medium text-[#EDE6D8]">
              {tr(UI.onboarding.goalLabel, lang)}
            </span>
            <div className="grid grid-cols-1 gap-2">
              {(
                [
                  ['stop', tr(UI.onboarding.goalStop, lang)],
                  ['limit', tr(UI.onboarding.goalLimit, lang)],
                  ['custom', tr(UI.onboarding.goalCustom, lang)],
                ] as const
              ).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setGoalMode(mode)}
                  className={`min-h-[44px] w-full rounded-xl border px-4 py-2.5 text-left text-sm transition ${
                    goalMode === mode
                      ? 'border-[#8A9A86] bg-[#8A9A86]/12 text-[#EDE6D8]'
                      : 'border-[#27324A] bg-[#0F1522] text-[#8892A4] hover:text-[#EDE6D8]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {goalMode === 'custom' && (
              <input
                type="text"
                value={customGoalText}
                onChange={(e) => setCustomGoalText(e.target.value)}
                placeholder={tr(UI.onboarding.goalCustomPh, lang)}
                className="mt-2 min-h-[44px] w-full rounded-xl border border-[#27324A] bg-[#0F1522] px-4 py-2.5 text-sm text-[#EDE6D8] placeholder:text-[#8892A4]/70"
              />
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="onb-reason" className="block text-sm font-medium text-[#EDE6D8]">
              {tr(UI.onboarding.reasonLabel, lang)}
            </label>
            <textarea
              id="onb-reason"
              rows={2}
              value={initialReason}
              onChange={(e) => setInitialReason(e.target.value)}
              placeholder={tr(UI.onboarding.reasonPh, lang)}
              className="w-full rounded-xl border border-[#27324A] bg-[#0F1522] px-4 py-3 text-sm text-[#EDE6D8] placeholder:text-[#8892A4]/70 resize-y"
            />
          </div>

          <label className="flex items-start gap-3 rounded-xl bg-[#0F1522] p-3.5 cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              checked={confirmed18}
              onChange={(e) => setConfirmed18(e.target.checked)}
              className="mt-1 h-5 w-5 shrink-0 accent-[#8A9A86]"
            />
            <span className="text-sm leading-relaxed text-[#EDE6D8]">
              {tr(UI.onboarding.ageLabel, lang)}
            </span>
          </label>

          <button
            type="submit"
            disabled={!confirmed18}
            className="min-h-[52px] w-full rounded-full bg-[#8A9A86] px-6 py-3 text-base font-semibold text-[#0B0F17] transition hover:bg-[#9BAA97] disabled:bg-[#1A2233] disabled:text-[#6B7689]"
          >
            {tr(UI.onboarding.startBtn, lang)}
          </button>
        </form>
      </div>
    </div>
  );
};

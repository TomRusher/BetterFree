import React, { useState } from 'react';
import { Check, Plus, ShieldAlert } from 'lucide-react';
import type { AppState, Lang, MoodCheckin, UrgeLog, UrgeOutcome } from '../types/app';
import { DEFAULT_TRIGGERS, EMOTION_TAGS, WEEKLY_EXPERIMENTS } from '../data/content';
import { tr, UI } from '../data/uiStrings';
import { currentWeekKey, todayKey } from '../utils/stateLogic';

interface HomeViewProps {
  state: AppState;
  onOpenSos: () => void;
  onSaveMood: (entry: Omit<MoodCheckin, 'id' | 'date' | 'timestamp'>) => void;
  onSaveUrge: (entry: Omit<UrgeLog, 'id' | 'date' | 'timestamp'>) => void;
  onAddCustomTrigger: (tag: string) => void;
  onToggleExperiment: (expId: string) => void;
  onToggleExperimentToday: (expId: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  state,
  onOpenSos,
  onSaveMood,
  onSaveUrge,
  onAddCustomTrigger,
  onToggleExperiment,
  onToggleExperimentToday,
}) => {
  const lang: Lang = state.lang;
  const today = todayKey();
  const week = currentWeekKey();

  // Mood check-in state
  const todayMood = state.moodCheckins.find((m) => m.date === today);
  const [showMoodForm, setShowMoodForm] = useState(!todayMood);
  const [moodVal, setMoodVal] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [moodEmotions, setMoodEmotions] = useState<string[]>([]);
  const [moodNote, setMoodNote] = useState('');

  // Quick urge log state
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [newTrigger, setNewTrigger] = useState('');
  const [intensity, setIntensity] = useState<number | null>(null);
  const [outcome, setOutcome] = useState<UrgeOutcome>('passed');
  const [urgeNote, setUrgeNote] = useState('');
  const [urgeSavedFlash, setUrgeSavedFlash] = useState(false);

  // Weekly experiments picker toggle
  const [pickingExperiments, setPickingExperiments] = useState(false);

  const weekExps = state.activeExperiments.filter((e) => e.weekKey === week);
  const activeExpIds = new Set(weekExps.map((e) => e.id));

  const allTriggers = [
    ...DEFAULT_TRIGGERS.map((t) => tr(t.label, lang)),
    ...state.customTriggers.filter(
      (ct) => !DEFAULT_TRIGGERS.some((dt) => tr(dt.label, lang).toLowerCase() === ct.toLowerCase())
    ),
  ];

  const handleToggleMoodEmotion = (label: string) => {
    setMoodEmotions((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const handleMoodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveMood({
      mood: moodVal,
      emotions: moodEmotions,
      note: moodNote.trim(),
    });
    setMoodEmotions([]);
    setMoodNote('');
    setShowMoodForm(false);
  };

  const handleToggleTrigger = (tag: string) => {
    setSelectedTriggers((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddTrigger = () => {
    const clean = newTrigger.trim();
    if (!clean) return;
    onAddCustomTrigger(clean);
    if (!selectedTriggers.includes(clean)) {
      setSelectedTriggers((prev) => [...prev, clean]);
    }
    setNewTrigger('');
  };

  const handleUrgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveUrge({
      triggers: selectedTriggers,
      intensity,
      outcome,
      note: urgeNote.trim(),
    });
    setSelectedTriggers([]);
    setIntensity(null);
    setUrgeNote('');
    setOutcome('passed');
    setUrgeSavedFlash(true);
    window.setTimeout(() => setUrgeSavedFlash(false), 3200);
  };

  const primaryReason = state.reasons[0] ?? '';

  return (
    <div className="space-y-5">
      {/* SOS Quick Anchor */}
      <section className="rounded-3xl border border-[#243047] bg-[#121826] p-5 sm:p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#EDE6D8]">
              {tr(UI.home.sosTitle, lang)}
            </h1>
            <p className="text-sm text-[#8892A4] leading-relaxed">{tr(UI.home.sosDesc, lang)}</p>
          </div>
          <div className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1B2540] text-[#9DB4E0]">
            <ShieldAlert className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenSos}
          className="min-h-[52px] w-full rounded-full bg-[#8A9A86] px-6 py-3 text-base font-semibold text-[#0B0F17] transition hover:bg-[#9BAA97]"
        >
          {tr(UI.home.sosBtn, lang)}
        </button>
      </section>

      {/* Quiet Reason / Plan reminder when present */}
      {(primaryReason || state.ifThenPlan) && (
        <section className="rounded-2xl border border-[#1D2638] bg-[#101624] p-5 space-y-2">
          {primaryReason && (
            <div>
              <div className="text-xs font-medium text-[#8892A4]">{tr(UI.home.reasonCard, lang)}</div>
              <p className="mt-1 text-[15px] italic text-[#EDE6D8] leading-relaxed">
                „{primaryReason}“
              </p>
            </div>
          )}
          {state.ifThenPlan && (
            <div className={primaryReason ? 'pt-2 border-t border-[#1D2638]' : ''}>
              <div className="text-xs font-medium text-[#8892A4]">{tr(UI.home.planCard, lang)}</div>
              <p className="mt-1 text-sm text-[#9DB4E0] leading-relaxed">{state.ifThenPlan}</p>
            </div>
          )}
        </section>
      )}

      {/* Two-column balanced grid on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        <div className="space-y-5">
          {/* Mood Check-in */}
          <section className="rounded-2xl border border-[#1D2638] bg-[#121826] p-5 space-y-4">
          <div className="space-y-0.5">
            <h2 className="text-lg font-semibold text-[#EDE6D8]">
              {tr(UI.home.moodTitle, lang)}
            </h2>
            <p className="text-sm text-[#8892A4]">{tr(UI.home.moodSub, lang)}</p>
          </div>

          {!showMoodForm && todayMood ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-[#1D2638] bg-[#0F1522] px-4 py-3">
                <span className="text-sm text-[#EDE6D8]">{tr(UI.home.moodSaved, lang)}</span>
                <span className="font-mono text-sm font-medium text-[#8A9A86] tabular-nums">
                  {todayMood.mood} / 5
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowMoodForm(true)}
                className="min-h-[44px] w-full rounded-xl border border-[#2C3A54] bg-[#0F1522] px-4 text-sm font-medium text-[#9DB4E0] transition hover:border-[#5C7FB8]"
              >
                {tr(UI.home.moodAgain, lang)}
              </button>
            </div>
          ) : (
            <form onSubmit={handleMoodSubmit} className="space-y-4">
              <div className="grid grid-cols-5 gap-2" role="group" aria-label={tr(UI.home.moodTitle, lang)}>
                {([1, 2, 3, 4, 5] as const).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setMoodVal(n)}
                    aria-pressed={moodVal === n}
                    className={`min-h-[46px] rounded-xl border font-mono text-base font-medium tabular-nums transition ${
                      moodVal === n
                        ? 'border-[#8A9A86] bg-[#8A9A86] text-[#0B0F17]'
                        : 'border-[#27324A] bg-[#0F1522] text-[#EDE6D8] hover:border-[#5C7FB8]'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <span className="block text-xs text-[#8892A4]">
                  {tr(UI.home.moodEmotions, lang)}
                </span>
                <div className="flex flex-wrap gap-2">
                  {EMOTION_TAGS.map((tag) => {
                    const label = tr(tag.label, lang);
                    const active = moodEmotions.includes(label);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleToggleMoodEmotion(label)}
                        aria-pressed={active}
                        className={`min-h-[38px] rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                          active
                            ? 'border-[#5C7FB8] bg-[#1B2540] text-[#9DB4E0]'
                            : 'border-[#27324A] bg-[#0F1522] text-[#8892A4] hover:text-[#EDE6D8]'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <textarea
                rows={2}
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
                placeholder={tr(UI.home.moodNotePh, lang)}
                aria-label={tr(UI.home.moodNotePh, lang)}
                className="w-full rounded-xl border border-[#27324A] bg-[#0F1522] px-3.5 py-2.5 text-sm text-[#EDE6D8] placeholder:text-[#8892A4]/70 resize-y"
              />

              <button
                type="submit"
                className="min-h-[48px] w-full rounded-full bg-[#8A9A86] px-5 text-sm font-semibold text-[#0B0F17] transition hover:bg-[#9BAA97]"
              >
                {tr(UI.home.moodSaveBtn, lang)}
              </button>
            </form>
          )}
        </section>

        {/* Weekly Experiments (Calendar template, user-chosen) */}
        <section className="rounded-2xl border border-[#1D2638] bg-[#121826] p-5 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-0.5">
              <h2 className="text-lg font-semibold text-[#EDE6D8]">
                {tr(UI.home.expTitle, lang)}
              </h2>
              <p className="text-sm text-[#8892A4]">{tr(UI.home.expSub, lang)}</p>
            </div>
            <button
              type="button"
              onClick={() => setPickingExperiments((prev) => !prev)}
              className="min-h-[44px] rounded-xl border border-[#2C3A54] bg-[#0F1522] px-4 text-xs font-medium text-[#9DB4E0] hover:border-[#5C7FB8] whitespace-nowrap shrink-0"
            >
              {pickingExperiments
                ? tr(UI.settings.close, lang)
                : tr(UI.home.expChoose, lang)}
            </button>
          </div>

          {pickingExperiments && (
            <div className="grid grid-cols-1 gap-2.5 pt-1">
              {WEEKLY_EXPERIMENTS.map((exp) => {
                const selected = activeExpIds.has(exp.id);
                const disabled = !selected && activeExpIds.size >= 3;
                return (
                  <button
                    key={exp.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => onToggleExperiment(exp.id)}
                    className={`min-h-[54px] rounded-xl border p-3.5 text-left transition ${
                      selected
                        ? 'border-[#8A9A86] bg-[#8A9A86]/15 text-[#EDE6D8]'
                        : 'border-[#27324A] bg-[#0F1522] text-[#8892A4] disabled:opacity-40'
                    }`}
                  >
                    <div className="text-sm font-medium text-[#EDE6D8]">{tr(exp.title, lang)}</div>
                    <div className="mt-0.5 text-xs text-[#8892A4]">{tr(exp.detail, lang)}</div>
                  </button>
                );
              })}
            </div>
          )}

          {weekExps.length === 0 ? (
            <p className="text-sm text-[#8892A4]">{tr(UI.home.expEmpty, lang)}</p>
          ) : (
            <div className="space-y-2">
              {weekExps.map((sel) => {
                const def = WEEKLY_EXPERIMENTS.find((e) => e.id === sel.id);
                if (!def) return null;
                const checkedToday = sel.checkedDays.includes(today);
                return (
                  <button
                    key={sel.id}
                    type="button"
                    onClick={() => onToggleExperimentToday(sel.id)}
                    className="min-h-[54px] w-full flex items-center justify-between gap-3 rounded-xl border border-[#27324A] bg-[#0F1522] px-4 py-3 text-left transition hover:border-[#5C7FB8]"
                  >
                    <div>
                      <div className="text-sm font-medium text-[#EDE6D8]">{tr(def.title, lang)}</div>
                      <div className="text-xs text-[#8892A4]">{tr(def.detail, lang)}</div>
                    </div>
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition ${
                        checkedToday
                          ? 'border-[#8A9A86] bg-[#8A9A86] text-[#0B0F17]'
                          : 'border-[#3A4A66] bg-transparent text-transparent'
                      }`}
                      aria-label={tr(UI.home.expDoneLabel, lang)}
                    >
                      <Check className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>
        </div>

        {/* Quick Urge Log <= 10s */}
        <section className="rounded-2xl border border-[#1D2638] bg-[#121826] p-5 space-y-4">
          <div className="space-y-0.5">
            <h2 className="text-lg font-semibold text-[#EDE6D8]">
              {tr(UI.home.urgeTitle, lang)}
            </h2>
            <p className="text-sm text-[#8892A4]">{tr(UI.home.urgeSub, lang)}</p>
          </div>

          <form onSubmit={handleUrgeSubmit} className="space-y-4">
            <div className="space-y-2">
              <span className="block text-xs text-[#8892A4]">
                {tr(UI.home.urgeTriggers, lang)}
              </span>
              <div className="flex flex-wrap gap-2">
                {allTriggers.map((tag) => {
                  const active = selectedTriggers.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleTrigger(tag)}
                      aria-pressed={active}
                      className={`min-h-[38px] rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                        active
                          ? 'border-[#8A9A86] bg-[#8A9A86]/20 text-[#EDE6D8]'
                          : 'border-[#27324A] bg-[#0F1522] text-[#8892A4] hover:text-[#EDE6D8]'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newTrigger}
                  onChange={(e) => setNewTrigger(e.target.value)}
                  placeholder={tr(UI.home.urgeAddTriggerPh, lang)}
                  aria-label={tr(UI.home.urgeAddTriggerPh, lang)}
                  className="min-h-[42px] flex-1 rounded-xl border border-[#27324A] bg-[#0F1522] px-3 text-sm text-[#EDE6D8] placeholder:text-[#8892A4]/70"
                />
                <button
                  type="button"
                  onClick={handleAddTrigger}
                  className="min-h-[42px] rounded-xl border border-[#2C3A54] bg-[#0F1522] px-3.5 text-xs font-medium text-[#9DB4E0] hover:border-[#5C7FB8] inline-flex items-center gap-1 whitespace-nowrap shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  {tr(UI.home.urgeAddTriggerBtn, lang)}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-[#8892A4]">
                <span>{tr(UI.home.urgeIntensity, lang)}</span>
                <span className="font-mono tabular-nums text-[#EDE6D8]">
                  {intensity === null ? tr(UI.home.urgeIntensitySkip, lang) : `${intensity} / 10`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={intensity ?? 5}
                  onChange={(e) => setIntensity(Number(e.target.value))}
                  aria-label={tr(UI.home.urgeIntensity, lang)}
                  className="flex-1 accent-[#8A9A86]"
                />
                {intensity !== null && (
                  <button
                    type="button"
                    onClick={() => setIntensity(null)}
                    className="min-h-[36px] px-2.5 text-xs text-[#8892A4] hover:text-[#EDE6D8]"
                  >
                    {tr(UI.home.urgeIntensitySkip, lang)}
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <span className="block text-xs text-[#8892A4]">
                {tr(UI.home.urgeOutcome, lang)}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOutcome('passed')}
                  aria-pressed={outcome === 'passed'}
                  className={`min-h-[44px] rounded-xl border px-3 py-2 text-sm font-medium transition ${
                    outcome === 'passed'
                      ? 'border-[#8A9A86] bg-[#8A9A86]/20 text-[#EDE6D8]'
                      : 'border-[#27324A] bg-[#0F1522] text-[#8892A4]'
                  }`}
                >
                  {tr(UI.home.urgePassed, lang)}
                </button>
                <button
                  type="button"
                  onClick={() => setOutcome('returned')}
                  aria-pressed={outcome === 'returned'}
                  className={`min-h-[44px] rounded-xl border px-3 py-2 text-sm font-medium transition ${
                    outcome === 'returned'
                      ? 'border-[#5C7FB8] bg-[#1B2540] text-[#9DB4E0]'
                      : 'border-[#27324A] bg-[#0F1522] text-[#8892A4]'
                  }`}
                >
                  {tr(UI.home.urgeReturned, lang)}
                </button>
              </div>
            </div>

            <input
              type="text"
              value={urgeNote}
              onChange={(e) => setUrgeNote(e.target.value)}
              placeholder={tr(UI.home.urgeNotePh, lang)}
              aria-label={tr(UI.home.urgeNotePh, lang)}
              className="min-h-[44px] w-full rounded-xl border border-[#27324A] bg-[#0F1522] px-3.5 text-sm text-[#EDE6D8] placeholder:text-[#8892A4]/70"
            />

            <button
              type="submit"
              className="min-h-[48px] w-full rounded-full bg-[#8A9A86] px-5 text-sm font-semibold text-[#0B0F17] transition hover:bg-[#9BAA97]"
            >
              {tr(UI.home.urgeSaveBtn, lang)}
            </button>

            {urgeSavedFlash && (
              <p role="status" className="text-sm text-[#8A9A86] text-center">
                {tr(UI.home.urgeSavedMsg, lang)}
              </p>
            )}
          </form>
        </section>
      </div>
    </div>
  );
};

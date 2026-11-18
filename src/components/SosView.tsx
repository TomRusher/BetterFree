import React, { useEffect, useState } from 'react';
import { ArrowLeft, Heart, Minus, Phone, Plus, Star } from 'lucide-react';
import type { AppState, SosCategoryId, UrgeLog, UrgeOutcome } from '../types/app';
import { CRISIS_CONTACTS, SOS_TECHNIQUES, SOS_TILES, type SosTechnique } from '../data/content';
import { tr, UI } from '../data/uiStrings';

interface SosViewProps {
  state: AppState;
  initialPhase?: 'pause' | 'crisis';
  onUpdatePauseMinutes: (mins: number) => void;
  onToggleFavoriteSos: (id: string) => void;
  onMarkRecentSos: (id: string) => void;
  onSavePostUrge: (entry: Omit<UrgeLog, 'id' | 'date' | 'timestamp'>) => void;
  onGoToJournalReasons: () => void;
  onExitToHome: () => void;
}

type SosPhase = 'pause' | 'tiles' | 'category' | 'technique' | 'after' | 'crisis';

export const SosView: React.FC<SosViewProps> = ({
  state,
  initialPhase = 'pause',
  onUpdatePauseMinutes,
  onToggleFavoriteSos,
  onMarkRecentSos,
  onSavePostUrge,
  onGoToJournalReasons,
  onExitToHome,
}) => {
  const lang = state.lang;
  const [phase, setPhase] = useState<SosPhase>(initialPhase);
  const [selectedCategory, setSelectedCategory] = useState<SosCategoryId | null>(null);
  const [selectedTech, setSelectedTech] = useState<SosTechnique | null>(null);
  const [timeFilter, setTimeFilter] = useState<'all' | 2 | 10 | 20 | 'fav'>('all');

  // Countdown state in seconds
  const [secondsLeft, setSecondsLeft] = useState(state.pauseMinutes * 60);
  const [timerRunning, setTimerRunning] = useState(true);

  // 4-7-8 Breathing state
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'in' | 'hold' | 'out'>('in');
  const [breathCount, setBreathCount] = useState(4);

  // Post-SOS optional <=20s log
  const [afterOutcome, setAfterOutcome] = useState<UrgeOutcome>('passed');
  const [afterIntensity, setAfterIntensity] = useState<number | null>(null);
  const [afterNote, setAfterNote] = useState('');
  const [afterSaved, setAfterSaved] = useState(false);

  useEffect(() => {
    setPhase(initialPhase);
  }, [initialPhase]);

  useEffect(() => {
    setSecondsLeft(state.pauseMinutes * 60);
  }, [state.pauseMinutes]);

  useEffect(() => {
    if (phase !== 'pause' || !timerRunning) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase, timerRunning]);

  // 4-7-8 breathing loop
  useEffect(() => {
    if (!breathingActive || phase !== 'technique') return;
    const sequence: { kind: 'in' | 'hold' | 'out'; secs: number }[] = [
      { kind: 'in', secs: 4 },
      { kind: 'hold', secs: 7 },
      { kind: 'out', secs: 8 },
    ];
    let stepIdx = 0;
    let remaining = sequence[0].secs;
    setBreathPhase('in');
    setBreathCount(4);

    const id = window.setInterval(() => {
      remaining -= 1;
      if (remaining > 0) {
        setBreathCount(remaining);
      } else {
        stepIdx = (stepIdx + 1) % sequence.length;
        remaining = sequence[stepIdx].secs;
        setBreathPhase(sequence[stepIdx].kind);
        setBreathCount(remaining);
      }
    }, 1000);

    return () => window.clearInterval(id);
  }, [breathingActive, phase]);

  const formatMMSS = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const openCategory = (cat: SosCategoryId) => {
    setSelectedCategory(cat);
    setPhase('category');
  };

  const openTechnique = (tech: SosTechnique) => {
    setSelectedTech(tech);
    setBreathingActive(false);
    onMarkRecentSos(tech.id);
    setPhase('technique');
  };

  const handleSaveAfter = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePostUrge({
      triggers: [],
      intensity: afterIntensity,
      outcome: afterOutcome,
      note: afterNote.trim(),
    });
    setAfterSaved(true);
    setAfterNote('');
    setAfterIntensity(null);
  };

  // Phase 5: Fixed Crisis Contacts
  if (phase === 'crisis') {
    return (
      <div className="space-y-5">
        <button
          type="button"
          onClick={() => setPhase('pause')}
          className="inline-flex min-h-[44px] items-center gap-1.5 text-sm text-[#8892A4] hover:text-[#EDE6D8]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {tr(UI.sos.backToPause, lang)}
        </button>

        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold text-[#EDE6D8]">{tr(UI.sos.crisisTitle, lang)}</h1>
          <p className="text-sm text-[#8892A4] leading-relaxed">{tr(UI.sos.crisisSub, lang)}</p>
        </div>

        <div className="space-y-3">
          {CRISIS_CONTACTS.map((c) => (
            <div
              key={c.tel}
              className="rounded-2xl border border-[#1D2638] bg-[#121826] p-4 flex items-center justify-between gap-4"
            >
              <div className="space-y-0.5">
                <div className="text-base font-semibold text-[#EDE6D8]">{tr(c.name, lang)}</div>
                <div className="text-xs text-[#8892A4]">{tr(c.desc, lang)}</div>
              </div>
              <a
                href={`tel:${c.tel}`}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#8A9A86] px-4 py-2 font-mono text-sm font-semibold text-[#0B0F17] tabular-nums whitespace-nowrap shrink-0 hover:bg-[#9BAA97]"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                {c.number}
              </a>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-[#1D2638] bg-[#101624] p-4 text-xs text-[#8892A4] leading-relaxed">
          {tr(UI.sos.crisisNote, lang)}
        </div>
      </div>
    );
  }

  // Phase 4: Optional post-SOS log
  if (phase === 'after') {
    return (
      <div className="space-y-5">
        <button
          type="button"
          onClick={() => setPhase('tiles')}
          className="inline-flex min-h-[44px] items-center gap-1.5 text-sm text-[#8892A4] hover:text-[#EDE6D8]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {tr(UI.sos.backToTiles, lang)}
        </button>

        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-[#EDE6D8]">{tr(UI.sos.afterTitle, lang)}</h1>
          <p className="text-sm text-[#8892A4] leading-relaxed">{tr(UI.sos.afterSub, lang)}</p>
        </div>

        {afterSaved ? (
          <div className="rounded-2xl border border-[#1D2638] bg-[#121826] p-6 text-center space-y-4">
            <p className="text-base text-[#EDE6D8]">{tr(UI.sos.afterDone, lang)}</p>
            <button
              type="button"
              onClick={onExitToHome}
              className="min-h-[48px] w-full rounded-full bg-[#8A9A86] px-6 text-sm font-semibold text-[#0B0F17]"
            >
              {tr(UI.nav.home, lang)}
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSaveAfter}
            className="rounded-2xl border border-[#1D2638] bg-[#121826] p-5 space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAfterOutcome('passed')}
                aria-pressed={afterOutcome === 'passed'}
                className={`min-h-[46px] rounded-xl border px-3 text-sm font-medium transition ${
                  afterOutcome === 'passed'
                    ? 'border-[#8A9A86] bg-[#8A9A86]/20 text-[#EDE6D8]'
                    : 'border-[#27324A] bg-[#0F1522] text-[#8892A4]'
                }`}
              >
                {tr(UI.home.urgePassed, lang)}
              </button>
              <button
                type="button"
                onClick={() => setAfterOutcome('returned')}
                aria-pressed={afterOutcome === 'returned'}
                className={`min-h-[46px] rounded-xl border px-3 text-sm font-medium transition ${
                  afterOutcome === 'returned'
                    ? 'border-[#5C7FB8] bg-[#1B2540] text-[#9DB4E0]'
                    : 'border-[#27324A] bg-[#0F1522] text-[#8892A4]'
                }`}
              >
                {tr(UI.home.urgeReturned, lang)}
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-[#8892A4]">
                <span>{tr(UI.sos.afterIntensity, lang)}</span>
                <span className="font-mono tabular-nums text-[#EDE6D8]">
                  {afterIntensity === null ? tr(UI.home.urgeIntensitySkip, lang) : `${afterIntensity} / 10`}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                value={afterIntensity ?? 4}
                onChange={(e) => setAfterIntensity(Number(e.target.value))}
                aria-label={tr(UI.sos.afterIntensity, lang)}
                className="w-full accent-[#8A9A86]"
              />
            </div>

            <input
              type="text"
              value={afterNote}
              onChange={(e) => setAfterNote(e.target.value)}
              placeholder={tr(UI.home.urgeNotePh, lang)}
              aria-label={tr(UI.home.urgeNotePh, lang)}
              className="min-h-[44px] w-full rounded-xl border border-[#27324A] bg-[#0F1522] px-3.5 text-sm text-[#EDE6D8] placeholder:text-[#8892A4]/70"
            />

            <button
              type="submit"
              className="min-h-[48px] w-full rounded-full bg-[#8A9A86] px-6 text-sm font-semibold text-[#0B0F17]"
            >
              {tr(UI.home.urgeSaveBtn, lang)}
            </button>
            <button
              type="button"
              onClick={onExitToHome}
              className="min-h-[44px] w-full rounded-full border border-[#2C3A54] text-sm font-medium text-[#9DB4E0]"
            >
              {tr(UI.sos.afterSkip, lang)}
            </button>
          </form>
        )}
      </div>
    );
  }

  // Phase 3b: Guided Technique Detail + optional 4-7-8 breathing
  if (phase === 'technique' && selectedTech) {
    const isFav = state.favoriteSosIds.includes(selectedTech.id);
    const scaleClass =
      !breathingActive
        ? 'scale-75'
        : breathPhase === 'in' || breathPhase === 'hold'
          ? 'scale-100'
          : 'scale-[0.65]';

    const breathLabel = !breathingActive
      ? tr(UI.sos.breathReady, lang)
      : breathPhase === 'in'
        ? tr(UI.sos.breathIn, lang)
        : breathPhase === 'hold'
          ? tr(UI.sos.breathHold, lang)
          : tr(UI.sos.breathOut, lang);

    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              setBreathingActive(false);
              setPhase('category');
            }}
            className="inline-flex min-h-[44px] items-center gap-1.5 text-sm text-[#8892A4] hover:text-[#EDE6D8]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {tr(UI.sos.backToTiles, lang)}
          </button>

          <button
            type="button"
            onClick={() => onToggleFavoriteSos(selectedTech.id)}
            aria-label={isFav ? tr(UI.sos.favRemove, lang) : tr(UI.sos.favAdd, lang)}
            className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border px-3 text-xs font-medium ${
              isFav
                ? 'border-[#8A9A86] bg-[#8A9A86]/15 text-[#8A9A86]'
                : 'border-[#27324A] bg-[#121826] text-[#8892A4]'
            }`}
          >
            <Star className="h-4 w-4" fill={isFav ? 'currentColor' : 'none'} aria-hidden="true" />
            <span>{selectedTech.durationMin} {tr(UI.sos.timerMin, lang)}</span>
          </button>
        </div>

        <div className="rounded-3xl border border-[#1D2638] bg-[#121826] p-6 space-y-4">
          <h1 className="text-2xl font-semibold text-[#EDE6D8]">
            {tr(selectedTech.title, lang)}
          </h1>
          <p className="text-base leading-relaxed text-[#EDE6D8]/90">
            {tr(selectedTech.description, lang)}
          </p>

          {selectedTech.safetyNote && (
            <div className="rounded-xl border border-[#243047] bg-[#0F1522] p-3.5 text-xs text-[#9DB4E0] leading-relaxed">
              {tr(selectedTech.safetyNote, lang)}
            </div>
          )}

          {selectedTech.hasBreathingGuide && (
            <div className="pt-2 space-y-4 flex flex-col items-center">
              <div
                className={`breath-circle flex h-44 w-44 flex-col items-center justify-center rounded-full border-2 border-[#5C7FB8] bg-[#12203A] transition-transform ease-in-out ${scaleClass}`}
                style={{
                  transitionDuration:
                    breathPhase === 'in' ? '4000ms' : breathPhase === 'out' ? '8000ms' : '0ms',
                }}
              >
                <span className="text-base font-medium text-[#9DB4E0]">{breathLabel}</span>
                {breathingActive && (
                  <span className="font-mono text-3xl font-semibold text-[#EDE6D8] tabular-nums mt-1">
                    {breathCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setBreathingActive((prev) => !prev)}
                className="min-h-[44px] rounded-xl border border-[#2C3A54] bg-[#0F1522] px-5 text-sm font-medium text-[#9DB4E0]"
              >
                {breathingActive ? tr(UI.sos.breathStop, lang) : tr(UI.sos.breathStart, lang)}
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            setBreathingActive(false);
            setPhase('after');
          }}
          className="min-h-[52px] w-full rounded-full bg-[#8A9A86] px-6 text-base font-semibold text-[#0B0F17]"
        >
          {tr(UI.sos.finishedStep, lang)}
        </button>
      </div>
    );
  }

  // Phase 3a: Selected Tile Content (Plan, People, or Static Techniques)
  if (phase === 'category' && selectedCategory) {
    const catMeta = SOS_TILES.find((t) => t.id === selectedCategory)!;

    if (selectedCategory === 'plan') {
      return (
        <div className="space-y-5">
          <button
            type="button"
            onClick={() => setPhase('tiles')}
            className="inline-flex min-h-[44px] items-center gap-1.5 text-sm text-[#8892A4] hover:text-[#EDE6D8]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {tr(UI.sos.backToTiles, lang)}
          </button>

          <h1 className="text-2xl font-semibold text-[#EDE6D8]">{tr(catMeta.title, lang)}</h1>

          <div className="rounded-2xl border border-[#1D2638] bg-[#121826] p-5 space-y-4">
            {state.ifThenPlan ? (
              <p className="text-base leading-relaxed text-[#EDE6D8]">{state.ifThenPlan}</p>
            ) : (
              <p className="text-sm text-[#8892A4]">
                {lang === 'cs'
                  ? 'Zatím nemáš napsané vlastní pravidlo „Když X, tak Y“. Doplň si ho v Deníku.'
                  : 'You haven’t saved an "If X, then Y" rule yet. Add one in Journal.'}
              </p>
            )}
            <button
              type="button"
              onClick={onGoToJournalReasons}
              className="min-h-[44px] rounded-xl border border-[#2C3A54] bg-[#0F1522] px-4 text-sm font-medium text-[#9DB4E0]"
            >
              {tr(UI.journal.savePlan, lang)}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setPhase('after')}
            className="min-h-[50px] w-full rounded-full bg-[#8A9A86] px-6 text-base font-semibold text-[#0B0F17]"
          >
            {tr(UI.sos.finishedStep, lang)}
          </button>
        </div>
      );
    }

    if (selectedCategory === 'people') {
      const hasContact = Boolean(state.trustedContact.phone.trim());
      return (
        <div className="space-y-5">
          <button
            type="button"
            onClick={() => setPhase('tiles')}
            className="inline-flex min-h-[44px] items-center gap-1.5 text-sm text-[#8892A4] hover:text-[#EDE6D8]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {tr(UI.sos.backToTiles, lang)}
          </button>

          <h1 className="text-2xl font-semibold text-[#EDE6D8]">{tr(catMeta.title, lang)}</h1>

          <div className="rounded-2xl border border-[#1D2638] bg-[#121826] p-5 space-y-4">
            {hasContact ? (
              <>
                <div className="space-y-1">
                  <div className="text-lg font-semibold text-[#EDE6D8]">
                    {state.trustedContact.name || (lang === 'cs' ? 'Blízký kontakt' : 'Trusted contact')}
                  </div>
                  <div className="font-mono text-sm text-[#8892A4] tabular-nums">
                    {state.trustedContact.phone}
                  </div>
                </div>
                <a
                  href={`tel:${state.trustedContact.phone.replace(/\s+/g, '')}`}
                  className="inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full bg-[#8A9A86] px-6 text-base font-semibold text-[#0B0F17]"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {tr(UI.sos.callNow, lang)}
                </a>
              </>
            ) : (
              <>
                <p className="text-sm text-[#8892A4] leading-relaxed">
                  {tr(UI.sos.noContactSaved, lang)}
                </p>
                <button
                  type="button"
                  onClick={onGoToJournalReasons}
                  className="min-h-[44px] rounded-xl border border-[#2C3A54] bg-[#0F1522] px-4 text-sm font-medium text-[#9DB4E0]"
                >
                  {tr(UI.journal.saveContact, lang)}
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setPhase('crisis')}
            className="min-h-[46px] w-full rounded-full border border-[#2C3A54] text-sm font-medium text-[#9DB4E0]"
          >
            {tr(UI.sos.skipToCrisis, lang)}
          </button>
        </div>
      );
    }

    // Static technique list for move / breath / focus
    const techniques = SOS_TECHNIQUES.filter((tech) => {
      if (tech.category !== selectedCategory) return false;
      if (timeFilter === 'fav') return state.favoriteSosIds.includes(tech.id);
      if (timeFilter === 'all') return true;
      return tech.durationMin === timeFilter;
    }).sort((a, b) => {
      // Safe user-driven order: favorites first, then recently used
      const af = state.favoriteSosIds.includes(a.id) ? 1 : 0;
      const bf = state.favoriteSosIds.includes(b.id) ? 1 : 0;
      if (af !== bf) return bf - af;
      const ar = state.recentSosIds.indexOf(a.id);
      const br = state.recentSosIds.indexOf(b.id);
      return (ar === -1 ? 99 : ar) - (br === -1 ? 99 : br);
    });

    return (
      <div className="space-y-5">
        <button
          type="button"
          onClick={() => setPhase('tiles')}
          className="inline-flex min-h-[44px] items-center gap-1.5 text-sm text-[#8892A4] hover:text-[#EDE6D8]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {tr(UI.sos.backToTiles, lang)}
        </button>

        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-[#EDE6D8]">{tr(catMeta.title, lang)}</h1>
          <p className="text-sm text-[#8892A4]">{tr(catMeta.subtitle, lang)}</p>
        </div>

        {/* Safe time/favorite filters */}
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['all', tr(UI.sos.allTimes, lang)],
              [2, `2 ${tr(UI.sos.timerMin, lang)}`],
              [10, `10 ${tr(UI.sos.timerMin, lang)}`],
              [20, `20 ${tr(UI.sos.timerMin, lang)}`],
              ['fav', tr(UI.sos.onlyFavs, lang)],
            ] as const
          ).map(([val, label]) => (
            <button
              key={String(val)}
              type="button"
              onClick={() => setTimeFilter(val)}
              className={`min-h-[38px] rounded-xl border px-3 text-xs font-medium transition ${
                timeFilter === val
                  ? 'border-[#5C7FB8] bg-[#1B2540] text-[#9DB4E0]'
                  : 'border-[#27324A] bg-[#0F1522] text-[#8892A4]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {techniques.map((tech) => (
            <button
              key={tech.id}
              type="button"
              onClick={() => openTechnique(tech)}
              className="w-full rounded-2xl border border-[#1D2638] bg-[#121826] p-4 text-left transition hover:border-[#5C7FB8] space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-base font-semibold text-[#EDE6D8]">
                  {tr(tech.title, lang)}
                </span>
                <span className="font-mono text-xs text-[#8892A4] tabular-nums shrink-0">
                  {tech.durationMin} {tr(UI.sos.timerMin, lang)}
                </span>
              </div>
              <p className="text-sm text-[#8892A4] line-clamp-2">{tr(tech.description, lang)}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Phase 2: 5 Fixed Tiles ("Co teď")
  if (phase === 'tiles') {
    return (
      <div className="space-y-5">
        <button
          type="button"
          onClick={() => setPhase('pause')}
          className="inline-flex min-h-[44px] items-center gap-1.5 text-sm text-[#8892A4] hover:text-[#EDE6D8]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {tr(UI.sos.backToPause, lang)}
        </button>

        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-[#EDE6D8]">{tr(UI.sos.tilesTitle, lang)}</h1>
          <p className="text-sm text-[#8892A4]">{tr(UI.sos.tilesSub, lang)}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SOS_TILES.map((tile) => (
            <button
              key={tile.id}
              type="button"
              onClick={() => openCategory(tile.id)}
              className="min-h-[80px] rounded-2xl border border-[#1D2638] bg-[#121826] p-5 text-left transition hover:border-[#8A9A86] space-y-1"
            >
              <div className="text-base font-semibold text-[#EDE6D8]">{tr(tile.title, lang)}</div>
              <div className="text-sm text-[#8892A4]">{tr(tile.subtitle, lang)}</div>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setPhase('crisis')}
          className="min-h-[48px] w-full rounded-full border border-[#2C3A54] px-5 text-sm font-medium text-[#9DB4E0] hover:border-[#5C7FB8] inline-flex items-center justify-center gap-2"
        >
          <Heart className="h-4 w-4" aria-hidden="true" />
          {tr(UI.sos.skipToCrisis, lang)}
        </button>
      </div>
    );
  }

  // Phase 1: Pause (Zastav se + My Reasons + Editable Countdown)
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#EDE6D8]">
          {tr(UI.sos.pauseTitle, lang)}
        </h1>
        <p className="text-sm text-[#8892A4] leading-relaxed">{tr(UI.sos.pauseSub, lang)}</p>
      </div>

      {/* Countdown card */}
      <div className="rounded-3xl border border-[#1D2638] bg-[#121826] p-6 text-center space-y-4">
        <div className="text-xs font-medium text-[#8892A4]">{tr(UI.sos.timerLabel, lang)}</div>
        <div className="font-mono text-4xl sm:text-5xl font-semibold text-[#9DB4E0] tabular-nums">
          {formatMMSS(secondsLeft)}
        </div>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => onUpdatePauseMinutes(Math.max(1, state.pauseMinutes - 1))}
            aria-label="Decrease timer minutes"
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl border border-[#27324A] bg-[#0F1522] text-[#EDE6D8]"
          >
            <Minus className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setTimerRunning((prev) => !prev)}
            className="min-h-[44px] rounded-xl border border-[#2C3A54] bg-[#0F1522] px-5 text-sm font-medium text-[#EDE6D8]"
          >
            {timerRunning ? (lang === 'cs' ? 'Pozastavit' : 'Pause') : lang === 'cs' ? 'Spustit' : 'Resume'}
          </button>
          <button
            type="button"
            onClick={() => onUpdatePauseMinutes(Math.min(30, state.pauseMinutes + 1))}
            aria-label="Increase timer minutes"
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl border border-[#27324A] bg-[#0F1522] text-[#EDE6D8]"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* User's own "My reasons" card */}
      <div className="rounded-2xl border border-[#1D2638] bg-[#121826] p-5 space-y-3">
        <h2 className="text-base font-semibold text-[#EDE6D8]">{tr(UI.home.reasonCard, lang)}</h2>
        {state.reasons.length > 0 ? (
          <ul className="space-y-2">
            {state.reasons.map((r, idx) => (
              <li key={idx} className="text-[15px] italic text-[#EDE6D8]/95 leading-relaxed">
                „{r}“
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[#8892A4]">{tr(UI.sos.noReasonsYet, lang)}</p>
        )}
      </div>

      <button
        type="button"
        onClick={() => setPhase('tiles')}
        className="min-h-[52px] w-full rounded-full bg-[#8A9A86] px-6 text-base font-semibold text-[#0B0F17] transition hover:bg-[#9BAA97]"
      >
        {tr(UI.sos.continueToTiles, lang)}
      </button>

      <button
        type="button"
        onClick={() => setPhase('crisis')}
        className="min-h-[48px] w-full rounded-full border border-[#2C3A54] px-5 text-sm font-medium text-[#9DB4E0] hover:border-[#5C7FB8] inline-flex items-center justify-center gap-2"
      >
        <Heart className="h-4 w-4" aria-hidden="true" />
        {tr(UI.sos.skipToCrisis, lang)}
      </button>
    </div>
  );
};

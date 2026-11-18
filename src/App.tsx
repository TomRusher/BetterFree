import React, { useEffect, useState } from 'react';
import { BookOpen, FileText, Home, LifeBuoy, Lock, Settings, Sparkles } from 'lucide-react';
import type {
  AppState,
  Lang,
  MoodCheckin,
  PinConfig,
  ReminderSetting,
  TabId,
  TrustedContact,
  UrgeLog,
} from './types/app';
import { tr, UI } from './data/uiStrings';
import {
  computeSilentStones,
  createDefaultState,
  currentWeekKey,
  migrateLegacyState,
  recordActiveDay,
  STORAGE_KEY,
  todayKey,
  upsertDailyNote,
} from './utils/stateLogic';
import { useOnlineStatus } from './hooks/usePWAInstall';
import { BrandMark } from './components/BrandMark';
import { PWAInstallControl } from './components/PWAInstallControl';
import { OnboardingModal } from './components/OnboardingModal';
import { PinLockScreen } from './components/PinLockScreen';
import { HomeView } from './components/HomeView';
import { SosView } from './components/SosView';
import { JournalView } from './components/JournalView';
import { LibraryView } from './components/LibraryView';
import { MilestonesView } from './components/MilestonesView';
import { SettingsSheet } from './components/SettingsSheet';

function loadInitialState(): AppState {
  let state: AppState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    state = raw ? migrateLegacyState(JSON.parse(raw)) : createDefaultState('cs');
  } catch {
    state = createDefaultState('cs');
  }

  // Support ?autostart=1 for automated testability while preserving normal onboarding
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1' && !state.onboardingDone) {
      state = {
        ...state,
        onboardingDone: true,
        ageConfirmed18: true,
        disclaimerAccepted: true,
      };
    }
  }
  return state;
}

export default function App() {
  const [state, setState] = useState<AppState>(() => loadInitialState());
  const [isLocked, setIsLocked] = useState<boolean>(() => state.pin.enabled);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sosInitialPhase, setSosInitialPhase] = useState<'pause' | 'crisis'>('pause');
  const isOnline = useOnlineStatus();

  useEffect(() => {
    document.documentElement.lang = state.lang;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore quota/private mode errors gracefully
    }
  }, [state]);

  const updateState = (updater: (prev: AppState) => AppState) => {
    setState((prev) => {
      const next = updater(prev);
      return {
        ...next,
        stones: computeSilentStones(next),
      };
    });
  };

  const handleWipeAll = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setSettingsOpen(false);
    setIsLocked(false);
    setState(createDefaultState(state.lang));
  };

  if (isLocked && state.pin.enabled) {
    return (
      <PinLockScreen
        lang={state.lang}
        pinConfig={state.pin}
        onUnlock={() => setIsLocked(false)}
        onWipeAll={handleWipeAll}
      />
    );
  }

  if (!state.onboardingDone) {
    return (
      <OnboardingModal
        lang={state.lang}
        onChangeLang={(lang: Lang) => updateState((prev) => ({ ...prev, lang }))}
        onComplete={({ goalMode, customGoalText, initialReason }) =>
          updateState((prev) => ({
            ...prev,
            onboardingDone: true,
            ageConfirmed18: true,
            disclaimerAccepted: true,
            goalMode,
            customGoalText,
            reasons: initialReason ? [initialReason, ...prev.reasons] : prev.reasons,
          }))
        }
      />
    );
  }

  const navItems: { id: TabId; label: string; icon: React.ReactNode }[] = [
    ...(state.showMilestones
      ? [
          {
            id: 'milestones' as const,
            label: tr(UI.nav.milestones, state.lang),
            icon: <Sparkles className="h-5 w-5" aria-hidden="true" />,
          },
        ]
      : []),
    {
      id: 'library',
      label: tr(UI.nav.library, state.lang),
      icon: <BookOpen className="h-5 w-5" aria-hidden="true" />,
    },
    {
      id: 'home',
      label: tr(UI.nav.home, state.lang),
      icon: <Home className="h-5 w-5" aria-hidden="true" />,
    },
    {
      id: 'journal',
      label: tr(UI.nav.journal, state.lang),
      icon: <FileText className="h-5 w-5" aria-hidden="true" />,
    },
    {
      id: 'sos',
      label: tr(UI.nav.sos, state.lang),
      icon: <LifeBuoy className="h-5 w-5" aria-hidden="true" />,
    },
  ];

  const handleSelectTab = (tab: TabId) => {
    if (tab === 'sos') setSosInitialPhase('pause');
    updateState((prev) => ({ ...prev, activeTab: tab }));
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-[#EDE6D8] flex flex-col lg:flex-row">
      {/* Desktop left navigation rail */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:justify-between lg:border-r lg:border-[#1D2638] lg:bg-[#0E1420] lg:p-5 lg:sticky lg:top-0 lg:h-screen">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-2 px-2">
            <div className="flex items-center gap-2.5">
              <BrandMark size={26} />
              <span className="font-semibold tracking-tight text-[#8A9A86] text-lg">
                BetterFree
              </span>
            </div>
          </div>

          <nav aria-label="Main navigation" className="space-y-1.5">
            {navItems.map((item) => {
              const active = state.activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectTab(item.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`min-h-[46px] w-full flex items-center gap-3 rounded-xl px-3.5 text-sm font-medium transition whitespace-nowrap ${
                    active
                      ? 'bg-[#1B2540] text-[#8A9A86]'
                      : 'text-[#8892A4] hover:bg-[#121826] hover:text-[#EDE6D8]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-3 pt-4 border-t border-[#1D2638]">
          <PWAInstallControl lang={state.lang} compact />
          {state.pin.enabled && (
            <button
              type="button"
              onClick={() => setIsLocked(true)}
              className="min-h-[44px] w-full flex items-center gap-2.5 rounded-xl border border-[#27324A] bg-[#121826] px-3.5 text-sm text-[#9DB4E0] hover:border-[#5C7FB8]"
            >
              <Lock className="h-4 w-4" aria-hidden="true" />
              <span>{tr(UI.header.lockNow, state.lang)}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="min-h-[44px] w-full flex items-center gap-2.5 rounded-xl border border-[#1D2638] bg-[#121826] px-3.5 text-sm text-[#EDE6D8] hover:border-[#5C7FB8]"
          >
            <Settings className="h-4 w-4 text-[#8892A4]" aria-hidden="true" />
            <span>{tr(UI.header.settings, state.lang)}</span>
          </button>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Compact mobile top bar (<= 52px + safe area) */}
        <header className="lg:hidden sticky top-0 z-30 flex h-[52px] items-center justify-between border-b border-[#1D2638] bg-[#0B0F17]/95 backdrop-blur-md px-4 pt-safe">
          <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
            <BrandMark size={24} />
            <span className="font-semibold tracking-tight text-[#8A9A86]">BetterFree</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {state.pin.enabled && (
              <button
                type="button"
                onClick={() => setIsLocked(true)}
                aria-label={tr(UI.header.lockNow, state.lang)}
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl text-[#9DB4E0]"
              >
                <Lock className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              aria-label={tr(UI.header.settings, state.lang)}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl text-[#8892A4] hover:text-[#EDE6D8]"
            >
              <Settings className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Quiet offline banner when offline */}
        {!isOnline && (
          <div
            role="status"
            className="border-b border-[#1D2638] bg-[#121826] px-4 py-2 text-center text-xs text-[#9DB4E0]"
          >
            {tr(UI.header.offline, state.lang)}
          </div>
        )}

        {/* Content container */}
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 pb-24 lg:pb-10">
          {state.activeTab === 'home' && (
            <HomeView
              state={state}
              onOpenSos={() => handleSelectTab('sos')}
              onSaveMood={(entry: Omit<MoodCheckin, 'id' | 'date' | 'timestamp'>) =>
                updateState((prev) => ({
                  ...prev,
                  activeDays: recordActiveDay(prev),
                  moodCheckins: [
                    ...prev.moodCheckins,
                    {
                      id: `mood-${Date.now()}`,
                      date: todayKey(),
                      timestamp: Date.now(),
                      ...entry,
                    },
                  ],
                }))
              }
              onSaveUrge={(entry: Omit<UrgeLog, 'id' | 'date' | 'timestamp'>) =>
                updateState((prev) => ({
                  ...prev,
                  activeDays: recordActiveDay(prev),
                  urgeLogs: [
                    ...prev.urgeLogs,
                    {
                      id: `urge-${Date.now()}`,
                      date: todayKey(),
                      timestamp: Date.now(),
                      ...entry,
                    },
                  ],
                }))
              }
              onAddCustomTrigger={(tag: string) =>
                updateState((prev) => ({
                  ...prev,
                  customTriggers: prev.customTriggers.includes(tag)
                    ? prev.customTriggers
                    : [...prev.customTriggers, tag],
                }))
              }
              onToggleExperiment={(expId: string) =>
                updateState((prev) => {
                  const wk = currentWeekKey();
                  const exists = prev.activeExperiments.some(
                    (e) => e.id === expId && e.weekKey === wk
                  );
                  if (exists) {
                    return {
                      ...prev,
                      activeExperiments: prev.activeExperiments.filter(
                        (e) => !(e.id === expId && e.weekKey === wk)
                      ),
                    };
                  }
                  const currentCount = prev.activeExperiments.filter((e) => e.weekKey === wk).length;
                  if (currentCount >= 3) return prev;
                  return {
                    ...prev,
                    activeExperiments: [
                      ...prev.activeExperiments,
                      { id: expId, weekKey: wk, checkedDays: [], reflection: '' },
                    ],
                  };
                })
              }
              onToggleExperimentToday={(expId: string) =>
                updateState((prev) => {
                  const wk = currentWeekKey();
                  const td = todayKey();
                  return {
                    ...prev,
                    activeDays: recordActiveDay(prev, td),
                    activeExperiments: prev.activeExperiments.map((e) => {
                      if (e.id !== expId || e.weekKey !== wk) return e;
                      const done = e.checkedDays.includes(td);
                      return {
                        ...e,
                        checkedDays: done
                          ? e.checkedDays.filter((d) => d !== td)
                          : [...e.checkedDays, td],
                      };
                    }),
                  };
                })
              }
            />
          )}

          {state.activeTab === 'sos' && (
            <SosView
              state={state}
              initialPhase={sosInitialPhase}
              onUpdatePauseMinutes={(mins: number) =>
                updateState((prev) => ({ ...prev, pauseMinutes: mins }))
              }
              onToggleFavoriteSos={(id: string) =>
                updateState((prev) => ({
                  ...prev,
                  favoriteSosIds: prev.favoriteSosIds.includes(id)
                    ? prev.favoriteSosIds.filter((f) => f !== id)
                    : [...prev.favoriteSosIds, id],
                }))
              }
              onMarkRecentSos={(id: string) =>
                updateState((prev) => ({
                  ...prev,
                  recentSosIds: [id, ...prev.recentSosIds.filter((r) => r !== id)].slice(0, 10),
                }))
              }
              onSavePostUrge={(entry: Omit<UrgeLog, 'id' | 'date' | 'timestamp'>) =>
                updateState((prev) => ({
                  ...prev,
                  activeDays: recordActiveDay(prev),
                  urgeLogs: [
                    ...prev.urgeLogs,
                    {
                      id: `urge-${Date.now()}`,
                      date: todayKey(),
                      timestamp: Date.now(),
                      ...entry,
                    },
                  ],
                }))
              }
              onGoToJournalReasons={() =>
                updateState((prev) => ({
                  ...prev,
                  activeTab: 'journal',
                  seg: { ...prev.seg, journal: 'reasons' },
                }))
              }
              onExitToHome={() => handleSelectTab('home')}
            />
          )}

          {state.activeTab === 'journal' && (
            <JournalView
              state={state}
              onChangeSegment={(seg: 'notes' | 'reasons') =>
                updateState((prev) => ({ ...prev, seg: { ...prev.seg, journal: seg } }))
              }
              onSaveNote={(dateKey: string, displayDate: string, text: string) =>
                updateState((prev) => ({
                  ...prev,
                  activeDays: recordActiveDay(prev),
                  notes: upsertDailyNote(prev.notes, dateKey, displayDate, text),
                }))
              }
              onAddReason={(reason: string) =>
                updateState((prev) => ({ ...prev, reasons: [...prev.reasons, reason] }))
              }
              onRemoveReason={(index: number) =>
                updateState((prev) => ({
                  ...prev,
                  reasons: prev.reasons.filter((_, idx) => idx !== index),
                }))
              }
              onSavePlan={(plan: string) =>
                updateState((prev) => ({ ...prev, ifThenPlan: plan }))
              }
              onSaveContact={(contact: TrustedContact) =>
                updateState((prev) => ({ ...prev, trustedContact: contact }))
              }
            />
          )}

          {state.activeTab === 'library' && (
            <LibraryView
              state={state}
              onChangeSegment={(seg: 'read' | 'overviews') =>
                updateState((prev) => ({ ...prev, seg: { ...prev.seg, library: seg } }))
              }
              onToggleReadArticle={(id: string) =>
                updateState((prev) => ({
                  ...prev,
                  readArticleIds: prev.readArticleIds.includes(id)
                    ? prev.readArticleIds.filter((x) => x !== id)
                    : [...prev.readArticleIds, id],
                }))
              }
              onSaveReminder={(reminder: ReminderSetting) =>
                updateState((prev) => ({ ...prev, reminder }))
              }
            />
          )}

          {state.activeTab === 'milestones' && (
            <MilestonesView lang={state.lang} unlockedStones={state.stones} />
          )}
        </main>
      </div>

      {/* Mobile bottom tab bar (height <= 64px, well within 15% cap with 52px header) */}
      <nav
        aria-label="Bottom navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-[#1D2638] bg-[#0E1420]/95 backdrop-blur-md pb-safe"
      >
        <div
          className="grid h-[58px] items-center px-1"
          style={{ gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))` }}
        >
          {navItems.map((item) => {
            const active = state.activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                aria-current={active ? 'page' : undefined}
                className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition whitespace-nowrap ${
                  active ? 'text-[#8A9A86]' : 'text-[#6B7689] hover:text-[#EDE6D8]'
                }`}
              >
                {item.icon}
                <span className="truncate max-w-full px-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Settings Sheet */}
      {settingsOpen && (
        <SettingsSheet
          state={state}
          onClose={() => setSettingsOpen(false)}
          onToggleMilestones={() =>
            updateState((prev) => {
              const showMilestones = !prev.showMilestones;
              return {
                ...prev,
                showMilestones,
                activeTab: !showMilestones && prev.activeTab === 'milestones' ? 'home' : prev.activeTab,
              };
            })
          }
          onChangeLang={(lang: Lang) => updateState((prev) => ({ ...prev, lang }))}
          onSetPin={(pin: PinConfig) => updateState((prev) => ({ ...prev, pin }))}
          onLockNow={() => {
            setSettingsOpen(false);
            setIsLocked(true);
          }}
          onImportState={(restored: AppState) => {
            setState(restored);
            setIsLocked(false);
          }}
          onOpenCrisis={() => {
            setSosInitialPhase('crisis');
            updateState((prev) => ({ ...prev, activeTab: 'sos' }));
          }}
          onWipeAll={handleWipeAll}
        />
      )}
    </div>
  );
}

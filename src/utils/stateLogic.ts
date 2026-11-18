import type {
  ActiveExperiment,
  AppState,
  JournalNote,
  Lang,
  MoodCheckin,
  StoneId,
  TabId,
  UrgeLog,
} from '../types/app';

export const STORAGE_KEY = 'bf';

const VALID_STONES: StoneId[] = ['ch1', 'ch4', 'ch7', 'urge', 'why', 'week'];
const VALID_TABS: TabId[] = ['home', 'sos', 'journal', 'library', 'milestones'];

export function todayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function currentWeekKey(date = new Date()): string {
  const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${tmp.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export function createDefaultState(lang: Lang = 'cs'): AppState {
  return {
    version: 2,
    lang,
    onboardingDone: false,
    ageConfirmed18: false,
    disclaimerAccepted: false,
    goalMode: 'stop',
    customGoalText: '',
    showMilestones: true,
    activeTab: 'home',
    seg: {
      library: 'read',
      journal: 'notes',
    },
    notes: [],
    reasons: [],
    ifThenPlan: '',
    trustedContact: { name: '', phone: '' },
    customTriggers: [],
    moodCheckins: [],
    urgeLogs: [],
    activeExperiments: [],
    readArticleIds: [],
    favoriteSosIds: [],
    recentSosIds: [],
    pauseMinutes: 10,
    reminder: {
      enabled: false,
      dayOfWeek: 5,
      time: '21:00',
      label: '',
    },
    stones: [],
    activeDays: [],
    pin: {
      enabled: false,
      salt: '',
      hash: '',
    },
  };
}

function mapLegacyTab(tab: unknown): TabId {
  if (tab === 'ms') return 'milestones';
  if (tab === 'art') return 'library';
  if (tab === 'jr') return 'journal';
  if (typeof tab === 'string' && VALID_TABS.includes(tab as TabId)) {
    return tab as TabId;
  }
  return 'home';
}

export function migrateLegacyState(raw: unknown): AppState {
  if (!raw || typeof raw !== 'object') {
    return createDefaultState('cs');
  }
  const obj = raw as Record<string, unknown>;
  const lang: Lang = obj.lang === 'en' ? 'en' : 'cs';
  const base = createDefaultState(lang);

  // Check if this is already a v2 state
  const isV2 = obj.version === 2;

  const rawNotes = Array.isArray(obj.notes) ? obj.notes : [];
  const notes: JournalNote[] = rawNotes
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .map((n, index) => {
      const k =
        typeof n.k === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(n.k)
          ? n.k
          : `legacy-${String(index + 1).padStart(3, '0')}`;
      const d = typeof n.d === 'string' ? n.d : k;
      const x = typeof n.x === 'string' ? n.x : '';
      return { k, d, x };
    })
    .filter((n) => n.x.trim().length > 0);

  const reasonsSource = Array.isArray(obj.reasons)
    ? obj.reasons
    : Array.isArray(obj.mot)
      ? obj.mot
      : [];
  const reasons = reasonsSource.filter((r): r is string => typeof r === 'string' && r.trim().length > 0);

  const rawStones = Array.isArray(obj.stones) ? obj.stones : [];
  const stones = Array.from(
    new Set(rawStones.filter((s): s is StoneId => typeof s === 'string' && VALID_STONES.includes(s as StoneId)))
  );

  if (!isV2) {
    // Migrate legacy v1 prototype fields
    const legacyDone = typeof obj.done === 'number' && Number.isFinite(obj.done) ? obj.done : 0;
    const legacyStreak = typeof obj.streak === 'number' && Number.isFinite(obj.streak) ? obj.streak : 0;
    const showMilestones = typeof obj.ms === 'boolean' ? obj.ms : true;
    const activeTab = mapLegacyTab(obj.tab);
    const segObj = obj.seg && typeof obj.seg === 'object' ? (obj.seg as Record<string, unknown>) : {};
    const hasLegacyActivity = legacyDone > 0 || notes.length > 0 || reasons.length > 0 || stones.length > 0;
    const activeDays: string[] = [];
    if (typeof obj.lastCheck === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(obj.lastCheck)) {
      activeDays.push(obj.lastCheck);
    }
    if (legacyStreak >= 7 && !stones.includes('week')) {
      stones.push('week');
    }

    const migrated: AppState = {
      ...base,
      lang,
      onboardingDone: hasLegacyActivity,
      ageConfirmed18: hasLegacyActivity,
      disclaimerAccepted: hasLegacyActivity,
      showMilestones,
      activeTab: !showMilestones && activeTab === 'milestones' ? 'home' : activeTab,
      seg: {
        library: segObj.art === 'data' ? 'overviews' : 'read',
        journal: segObj.jr === 'mot' ? 'reasons' : 'notes',
      },
      notes,
      reasons,
      stones,
      activeDays,
    };
    migrated.stones = computeSilentStones(migrated);
    return migrated;
  }

  const moodCheckins: MoodCheckin[] = Array.isArray(obj.moodCheckins)
    ? obj.moodCheckins
        .filter((m): m is Record<string, unknown> => Boolean(m && typeof m === 'object'))
        .map((m) => ({
          id: typeof m.id === 'string' ? m.id : `mood-${Date.now()}`,
          date: typeof m.date === 'string' ? m.date : todayKey(),
          timestamp: typeof m.timestamp === 'number' && Number.isFinite(m.timestamp) ? m.timestamp : Date.now(),
          mood: ([1, 2, 3, 4, 5].includes(Number(m.mood)) ? Number(m.mood) : 3) as 1 | 2 | 3 | 4 | 5,
          emotions: Array.isArray(m.emotions)
            ? m.emotions.filter((e): e is string => typeof e === 'string')
            : [],
          note: typeof m.note === 'string' ? m.note : '',
        }))
    : [];

  const urgeLogs: UrgeLog[] = Array.isArray(obj.urgeLogs)
    ? obj.urgeLogs
        .filter((u): u is Record<string, unknown> => Boolean(u && typeof u === 'object'))
        .map((u) => ({
          id: typeof u.id === 'string' ? u.id : `urge-${Date.now()}`,
          date: typeof u.date === 'string' ? u.date : todayKey(),
          timestamp: typeof u.timestamp === 'number' && Number.isFinite(u.timestamp) ? u.timestamp : Date.now(),
          triggers: Array.isArray(u.triggers)
            ? u.triggers.filter((t): t is string => typeof t === 'string')
            : [],
          intensity:
            typeof u.intensity === 'number' && Number.isFinite(u.intensity)
              ? Math.max(0, Math.min(10, Math.round(u.intensity)))
              : null,
          outcome: (u.outcome === 'returned' ? 'returned' : 'passed') as 'passed' | 'returned',
          note: typeof u.note === 'string' ? u.note : '',
        }))
    : [];

  const activeExperiments: ActiveExperiment[] = Array.isArray(obj.activeExperiments)
    ? obj.activeExperiments
        .filter((e): e is Record<string, unknown> => Boolean(e && typeof e === 'object'))
        .map((e) => ({
          id: typeof e.id === 'string' ? e.id : '',
          weekKey: typeof e.weekKey === 'string' ? e.weekKey : currentWeekKey(),
          checkedDays: Array.isArray(e.checkedDays)
            ? e.checkedDays.filter((d): d is string => typeof d === 'string')
            : [],
          reflection: typeof e.reflection === 'string' ? e.reflection : '',
        }))
        .filter((e) => e.id.length > 0)
    : [];

  const segRaw = obj.seg && typeof obj.seg === 'object' ? (obj.seg as Record<string, unknown>) : {};
  const tcRaw =
    obj.trustedContact && typeof obj.trustedContact === 'object'
      ? (obj.trustedContact as Record<string, unknown>)
      : {};
  const remRaw =
    obj.reminder && typeof obj.reminder === 'object'
      ? (obj.reminder as Record<string, unknown>)
      : {};
  const pinRaw =
    obj.pin && typeof obj.pin === 'object' ? (obj.pin as Record<string, unknown>) : {};

  const showMilestones = typeof obj.showMilestones === 'boolean' ? obj.showMilestones : true;
  const parsedTab = mapLegacyTab(obj.activeTab);

  const v2: AppState = {
    version: 2,
    lang,
    onboardingDone: Boolean(obj.onboardingDone),
    ageConfirmed18: Boolean(obj.ageConfirmed18),
    disclaimerAccepted: Boolean(obj.disclaimerAccepted),
    goalMode:
      obj.goalMode === 'limit' || obj.goalMode === 'custom' ? obj.goalMode : 'stop',
    customGoalText: typeof obj.customGoalText === 'string' ? obj.customGoalText : '',
    showMilestones,
    activeTab: !showMilestones && parsedTab === 'milestones' ? 'home' : parsedTab,
    seg: {
      library: segRaw.library === 'overviews' ? 'overviews' : 'read',
      journal: segRaw.journal === 'reasons' ? 'reasons' : 'notes',
    },
    notes,
    reasons,
    ifThenPlan: typeof obj.ifThenPlan === 'string' ? obj.ifThenPlan : '',
    trustedContact: {
      name: typeof tcRaw.name === 'string' ? tcRaw.name : '',
      phone: typeof tcRaw.phone === 'string' ? tcRaw.phone : '',
    },
    customTriggers: Array.isArray(obj.customTriggers)
      ? obj.customTriggers.filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
      : [],
    moodCheckins,
    urgeLogs,
    activeExperiments,
    readArticleIds: Array.isArray(obj.readArticleIds)
      ? obj.readArticleIds.filter((id): id is string => typeof id === 'string')
      : [],
    favoriteSosIds: Array.isArray(obj.favoriteSosIds)
      ? obj.favoriteSosIds.filter((id): id is string => typeof id === 'string')
      : [],
    recentSosIds: Array.isArray(obj.recentSosIds)
      ? obj.recentSosIds.filter((id): id is string => typeof id === 'string')
      : [],
    pauseMinutes:
      typeof obj.pauseMinutes === 'number' && Number.isFinite(obj.pauseMinutes)
        ? Math.max(1, Math.min(30, Math.round(obj.pauseMinutes)))
        : 10,
    reminder: {
      enabled: Boolean(remRaw.enabled),
      dayOfWeek:
        typeof remRaw.dayOfWeek === 'number' && Number.isFinite(remRaw.dayOfWeek)
          ? Math.max(0, Math.min(6, Math.round(remRaw.dayOfWeek)))
          : 5,
      time: typeof remRaw.time === 'string' && /^\d{2}:\d{2}$/.test(remRaw.time) ? remRaw.time : '21:00',
      label: typeof remRaw.label === 'string' ? remRaw.label : '',
    },
    stones,
    activeDays: Array.isArray(obj.activeDays)
      ? Array.from(new Set(obj.activeDays.filter((d): d is string => typeof d === 'string')))
      : [],
    pin: {
      enabled: Boolean(pinRaw.enabled && typeof pinRaw.hash === 'string' && pinRaw.hash.length > 0),
      salt: typeof pinRaw.salt === 'string' ? pinRaw.salt : '',
      hash: typeof pinRaw.hash === 'string' ? pinRaw.hash : '',
    },
  };

  v2.stones = computeSilentStones(v2);
  return v2;
}

/**
 * Silent stones never disappear once unlocked, even if an urge log records a return to the old habit.
 */
export function computeSilentStones(state: AppState): StoneId[] {
  const unlocked = new Set<StoneId>(state.stones);

  if (
    state.onboardingDone &&
    (state.notes.length > 0 || state.moodCheckins.length > 0 || state.urgeLogs.length > 0)
  ) {
    unlocked.add('ch1');
  }
  if (state.moodCheckins.length + state.notes.length >= 5) {
    unlocked.add('ch4');
  }
  if (state.readArticleIds.length >= 5) {
    unlocked.add('ch7');
  }
  if (state.urgeLogs.some((u) => u.outcome === 'passed')) {
    unlocked.add('urge');
  }
  if (state.reasons.length > 0 || state.ifThenPlan.trim().length > 0) {
    unlocked.add('why');
  }

  const distinctDates = new Set<string>(state.activeDays);
  for (const m of state.moodCheckins) distinctDates.add(m.date);
  for (const u of state.urgeLogs) distinctDates.add(u.date);
  for (const n of state.notes) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(n.k)) distinctDates.add(n.k);
  }
  if (distinctDates.size >= 7) {
    unlocked.add('week');
  }

  return Array.from(unlocked);
}

export function upsertDailyNote(
  notes: JournalNote[],
  dateKey: string,
  displayDate: string,
  text: string
): JournalNote[] {
  const trimmed = text.trim();
  if (!trimmed) return notes;
  const idx = notes.findIndex((n) => n.k === dateKey);
  const next = [...notes];
  if (idx >= 0) {
    next[idx] = { ...next[idx], x: trimmed };
  } else {
    next.push({ k: dateKey, d: displayDate, x: trimmed });
  }
  return next.sort((a, b) => b.k.localeCompare(a.k));
}

export interface DescriptiveStats {
  totalUrges: number;
  passedUrges: number;
  returnedUrges: number;
  timeBuckets: { key: 'morning' | 'afternoon' | 'evening' | 'night'; count: number }[];
  triggerCounts: { tag: string; count: number }[];
  moodSeries: { date: string; mood: number }[];
  totalCheckins: number;
}

export function computeDescriptiveStats(state: AppState): DescriptiveStats {
  const totalUrges = state.urgeLogs.length;
  const passedUrges = state.urgeLogs.filter((u) => u.outcome === 'passed').length;
  const returnedUrges = totalUrges - passedUrges;

  const buckets = {
    morning: 0, // 06-11
    afternoon: 0, // 12-17
    evening: 0, // 18-23
    night: 0, // 00-05
  };

  const triggerMap = new Map<string, number>();

  for (const urge of state.urgeLogs) {
    const h = new Date(urge.timestamp).getHours();
    if (h >= 6 && h < 12) buckets.morning++;
    else if (h >= 12 && h < 18) buckets.afternoon++;
    else if (h >= 18 && h < 24) buckets.evening++;
    else buckets.night++;

    for (const trig of urge.triggers) {
      triggerMap.set(trig, (triggerMap.get(trig) ?? 0) + 1);
    }
  }

  const triggerCounts = Array.from(triggerMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);

  const sortedMoods = [...state.moodCheckins]
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(-14)
    .map((m) => ({ date: m.date, mood: m.mood }));

  return {
    totalUrges,
    passedUrges,
    returnedUrges,
    timeBuckets: [
      { key: 'morning', count: buckets.morning },
      { key: 'afternoon', count: buckets.afternoon },
      { key: 'evening', count: buckets.evening },
      { key: 'night', count: buckets.night },
    ],
    triggerCounts,
    moodSeries: sortedMoods,
    totalCheckins: state.moodCheckins.length,
  };
}

export function recordActiveDay(state: AppState, date = todayKey()): string[] {
  if (state.activeDays.includes(date)) return state.activeDays;
  return [...state.activeDays, date];
}

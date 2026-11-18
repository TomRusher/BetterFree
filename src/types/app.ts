export type Lang = 'cs' | 'en';

export type TabId = 'home' | 'sos' | 'journal' | 'library' | 'milestones';

export type GoalMode = 'stop' | 'limit' | 'custom';

export type UrgeOutcome = 'passed' | 'returned';

export type StoneId = 'ch1' | 'ch4' | 'ch7' | 'urge' | 'why' | 'week';

export type SosCategoryId = 'plan' | 'move' | 'breath' | 'focus' | 'people';

export interface BilingualText {
  cs: string;
  en: string;
}

export interface MoodCheckin {
  id: string;
  date: string;
  timestamp: number;
  mood: 1 | 2 | 3 | 4 | 5;
  emotions: string[];
  note: string;
}

export interface UrgeLog {
  id: string;
  date: string;
  timestamp: number;
  triggers: string[];
  intensity: number | null;
  outcome: UrgeOutcome;
  note: string;
}

export interface JournalNote {
  k: string;
  d: string;
  x: string;
}

export interface ActiveExperiment {
  id: string;
  weekKey: string;
  checkedDays: string[];
  reflection: string;
}

export interface TrustedContact {
  name: string;
  phone: string;
}

export interface ReminderSetting {
  enabled: boolean;
  dayOfWeek: number;
  time: string;
  label: string;
}

export interface PinConfig {
  enabled: boolean;
  salt: string;
  hash: string;
}

export interface AppState {
  version: 2;
  lang: Lang;
  onboardingDone: boolean;
  ageConfirmed18: boolean;
  disclaimerAccepted: boolean;
  goalMode: GoalMode;
  customGoalText: string;
  showMilestones: boolean;
  activeTab: TabId;
  seg: {
    library: 'read' | 'overviews';
    journal: 'notes' | 'reasons';
  };
  notes: JournalNote[];
  reasons: string[];
  ifThenPlan: string;
  trustedContact: TrustedContact;
  customTriggers: string[];
  moodCheckins: MoodCheckin[];
  urgeLogs: UrgeLog[];
  activeExperiments: ActiveExperiment[];
  readArticleIds: string[];
  favoriteSosIds: string[];
  recentSosIds: string[];
  pauseMinutes: number;
  reminder: ReminderSetting;
  stones: StoneId[];
  activeDays: string[];
  pin: PinConfig;
}

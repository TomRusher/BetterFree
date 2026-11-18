import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeDescriptiveStats,
  computeSilentStones,
  createDefaultState,
  migrateLegacyState,
  upsertDailyNote,
} from './stateLogic';

test('migrateLegacyState preserves notes (including keyless), motivations, stones, and language', () => {
  const legacy = {
    lang: 'cs',
    ms: false,
    done: 3,
    notes: [
      { k: '2026-11-10', d: 'úterý 10. listopadu', x: 'Dobrý večer bez telefonu.' },
      { d: 'starší zápis', x: 'Bez datového klíče' },
    ],
    mot: ['Chci klidnou hlavu.'],
    stones: ['ch1', 'urge'],
    streak: 7,
    lastCheck: '2026-11-10',
    tab: 'jr',
    seg: { art: 'data', jr: 'mot' },
  };

  const migrated = migrateLegacyState(legacy);
  assert.equal(migrated.version, 2);
  assert.equal(migrated.lang, 'cs');
  assert.equal(migrated.showMilestones, false);
  assert.equal(migrated.activeTab, 'journal');
  assert.equal(migrated.seg.library, 'overviews');
  assert.equal(migrated.seg.journal, 'reasons');
  assert.equal(migrated.onboardingDone, true);
  assert.equal(migrated.notes.length, 2);
  assert.equal(migrated.notes[1].k, 'legacy-002');
  assert.deepEqual(migrated.reasons, ['Chci klidnou hlavu.']);
  assert.ok(migrated.stones.includes('ch1'));
  assert.ok(migrated.stones.includes('urge'));
  assert.ok(migrated.stones.includes('why'));
  assert.ok(migrated.stones.includes('week'));
});

test('silent stones never disappear when an urge outcome is returned', () => {
  const state = createDefaultState('cs');
  state.onboardingDone = true;
  state.reasons = ['Pro klidný spánek'];
  state.urgeLogs = [
    {
      id: 'u1',
      date: '2026-11-18',
      timestamp: Date.now(),
      triggers: ['stres'],
      intensity: 6,
      outcome: 'passed',
      note: '',
    },
  ];
  const afterPass = computeSilentStones(state);
  assert.ok(afterPass.includes('urge'));
  assert.ok(afterPass.includes('why'));
  assert.ok(afterPass.includes('ch1'));

  state.stones = afterPass;
  state.urgeLogs.push({
    id: 'u2',
    date: '2026-11-18',
    timestamp: Date.now(),
    triggers: ['nuda'],
    intensity: 8,
    outcome: 'returned',
    note: '',
  });
  const afterReturn = computeSilentStones(state);
  assert.ok(afterReturn.includes('urge'));
  assert.ok(afterReturn.includes('why'));
  assert.ok(afterReturn.includes('ch1'));
});

test('upsertDailyNote replaces existing note for same date and sorts newest first', () => {
  let notes = upsertDailyNote([], '2026-11-17', 'úterý 17. listopadu', 'První verze');
  notes = upsertDailyNote(notes, '2026-11-17', 'úterý 17. listopadu', 'Upravená verze');
  notes = upsertDailyNote(notes, '2026-11-18', 'středa 18. listopadu', 'Dnešní zápis');

  assert.equal(notes.length, 2);
  assert.equal(notes[0].k, '2026-11-18');
  assert.equal(notes[1].x, 'Upravená verze');
});

test('computeDescriptiveStats counts urges, time buckets, triggers, and mood series accurately', () => {
  const state = createDefaultState('cs');
  const morningTs = new Date(2026, 10, 18, 9, 30, 0).getTime();
  const eveningTs = new Date(2026, 10, 18, 21, 15, 0).getTime();

  state.urgeLogs = [
    {
      id: '1',
      date: '2026-11-18',
      timestamp: morningTs,
      triggers: ['stres', 'únava'],
      intensity: 5,
      outcome: 'passed',
      note: '',
    },
    {
      id: '2',
      date: '2026-11-18',
      timestamp: eveningTs,
      triggers: ['stres', 'večer o samotě'],
      intensity: 7,
      outcome: 'returned',
      note: '',
    },
  ];
  state.moodCheckins = [
    {
      id: 'm1',
      date: '2026-11-18',
      timestamp: morningTs,
      mood: 4,
      emotions: ['klid'],
      note: '',
    },
  ];

  const stats = computeDescriptiveStats(state);
  assert.equal(stats.totalUrges, 2);
  assert.equal(stats.passedUrges, 1);
  assert.equal(stats.returnedUrges, 1);
  assert.equal(stats.timeBuckets.find((b) => b.key === 'morning')?.count, 1);
  assert.equal(stats.timeBuckets.find((b) => b.key === 'evening')?.count, 1);
  assert.equal(stats.triggerCounts[0].tag, 'stres');
  assert.equal(stats.triggerCounts[0].count, 2);
  assert.equal(stats.moodSeries.length, 1);
  assert.equal(stats.moodSeries[0].mood, 4);
});

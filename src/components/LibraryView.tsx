import React, { useState } from 'react';
import { Bell, Check } from 'lucide-react';
import type { AppState, ReminderSetting } from '../types/app';
import { ARTICLES } from '../data/content';
import { tr, UI } from '../data/uiStrings';
import { computeDescriptiveStats } from '../utils/stateLogic';

interface LibraryViewProps {
  state: AppState;
  onChangeSegment: (seg: 'read' | 'overviews') => void;
  onToggleReadArticle: (id: string) => void;
  onSaveReminder: (reminder: ReminderSetting) => void;
}

const DAYS_CS = ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'];
const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const LibraryView: React.FC<LibraryViewProps> = ({
  state,
  onChangeSegment,
  onToggleReadArticle,
  onSaveReminder,
}) => {
  const lang = state.lang;
  const [expandedId, setExpandedId] = useState<string | null>(ARTICLES[0].id);
  const [remEnabled, setRemEnabled] = useState(state.reminder.enabled);
  const [remDay, setRemDay] = useState(state.reminder.dayOfWeek);
  const [remTime, setRemTime] = useState(state.reminder.time);
  const [remLabel, setRemLabel] = useState(state.reminder.label);
  const [remSaved, setRemSaved] = useState(false);

  const stats = computeDescriptiveStats(state);
  const maxTimeBucket = Math.max(1, ...stats.timeBuckets.map((b) => b.count));
  const maxTriggerCount = Math.max(1, ...stats.triggerCounts.map((t) => t.count));

  const handleReminderSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveReminder({
      enabled: remEnabled,
      dayOfWeek: remDay,
      time: remTime,
      label: remLabel.trim(),
    });
    setRemSaved(true);
    window.setTimeout(() => setRemSaved(false), 2200);
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl sm:text-3xl font-semibold text-[#EDE6D8]">
        {tr(UI.library.title, lang)}
      </h1>

      {/* Segmented control */}
      <div role="tablist" className="flex rounded-2xl border border-[#1D2638] bg-[#0F1522] p-1">
        <button
          type="button"
          role="tab"
          aria-selected={state.seg.library === 'read'}
          onClick={() => onChangeSegment('read')}
          className={`min-h-[42px] flex-1 rounded-xl text-sm font-medium ${
            state.seg.library === 'read'
              ? 'bg-[#1B2540] text-[#9DB4E0]'
              : 'text-[#8892A4] hover:text-[#EDE6D8]'
          }`}
        >
          {tr(UI.library.segRead, lang)}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={state.seg.library === 'overviews'}
          onClick={() => onChangeSegment('overviews')}
          className={`min-h-[42px] flex-1 rounded-xl text-sm font-medium ${
            state.seg.library === 'overviews'
              ? 'bg-[#1B2540] text-[#9DB4E0]'
              : 'text-[#8892A4] hover:text-[#EDE6D8]'
          }`}
        >
          {tr(UI.library.segOverviews, lang)}
        </button>
      </div>

      {state.seg.library === 'read' ? (
        <div className="space-y-4">
          <p className="text-sm text-[#8892A4] leading-relaxed">{tr(UI.library.readIntro, lang)}</p>

          <div className="space-y-3">
            {ARTICLES.map((article) => {
              const isOpen = expandedId === article.id;
              const isRead = state.readArticleIds.includes(article.id);
              return (
                <article
                  key={article.id}
                  className="rounded-2xl border border-[#1D2638] bg-[#121826] p-5 space-y-3"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setExpandedId(isOpen ? null : article.id)}
                    className="w-full text-left space-y-1.5"
                  >
                    <div className="flex items-center gap-2 text-xs text-[#8892A4]">
                      <span>{tr(article.readTime, lang)}</span>
                      {isRead && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-[#8A9A86]">{tr(UI.library.markedRead, lang)}</span>
                        </>
                      )}
                    </div>
                    <h2 className="text-lg font-semibold text-[#EDE6D8]">
                      {tr(article.title, lang)}
                    </h2>
                    <p className="text-sm text-[#8892A4] leading-relaxed">
                      {tr(article.summary, lang)}
                    </p>
                  </button>

                  {isOpen && (
                    <div className="pt-3 border-t border-[#1D2638] space-y-3">
                      {article.paragraphs.map((p, idx) => (
                        <p key={idx} className="text-[15px] leading-relaxed text-[#EDE6D8]/92">
                          {tr(p, lang)}
                        </p>
                      ))}
                      <button
                        type="button"
                        onClick={() => onToggleReadArticle(article.id)}
                        className={`min-h-[42px] inline-flex items-center gap-2 rounded-xl border px-4 text-xs font-medium transition ${
                          isRead
                            ? 'border-[#8A9A86] bg-[#8A9A86]/15 text-[#8A9A86]'
                            : 'border-[#2C3A54] bg-[#0F1522] text-[#9DB4E0] hover:border-[#5C7FB8]'
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        {isRead ? tr(UI.library.markedRead, lang) : tr(UI.library.markRead, lang)}
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <p className="text-sm text-[#8892A4] leading-relaxed">
            {tr(UI.library.overviewsIntro, lang)}
          </p>

          {stats.totalUrges === 0 && stats.totalCheckins === 0 ? (
            <div className="rounded-2xl border border-[#1D2638] bg-[#121826] p-6 text-sm text-[#8892A4] leading-relaxed">
              {tr(UI.library.emptyOverviews, lang)}
            </div>
          ) : (
            <>
              {/* Descriptive counts */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  [tr(UI.library.statTotalUrges, lang), stats.totalUrges],
                  [tr(UI.library.statPassedUrges, lang), stats.passedUrges],
                  [tr(UI.library.statReturnedUrges, lang), stats.returnedUrges],
                  [tr(UI.library.statCheckins, lang), stats.totalCheckins],
                ].map(([label, value]) => (
                  <div
                    key={String(label)}
                    className="rounded-2xl border border-[#1D2638] bg-[#121826] p-4 space-y-1"
                  >
                    <div className="font-mono text-2xl font-semibold text-[#EDE6D8] tabular-nums">
                      {value}
                    </div>
                    <div className="text-xs text-[#8892A4] leading-snug">{label}</div>
                  </div>
                ))}
              </div>

              {/* Time of day distribution */}
              {stats.totalUrges > 0 && (
                <section className="rounded-2xl border border-[#1D2638] bg-[#121826] p-5 space-y-3.5">
                  <h2 className="text-base font-semibold text-[#EDE6D8]">
                    {tr(UI.library.chartTime, lang)}
                  </h2>
                  <div className="space-y-3">
                    {stats.timeBuckets.map((bucket) => {
                      const pct = Math.round((bucket.count / maxTimeBucket) * 100);
                      return (
                        <div key={bucket.key} className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-[#EDE6D8]">
                              {tr(UI.library[bucket.key], lang)}
                            </span>
                            <span className="font-mono text-[#8892A4] tabular-nums">
                              {bucket.count}
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-[#1A2233]">
                            <div
                              className="h-2 rounded-full bg-[#8A9A86]"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Trigger frequency */}
              {stats.triggerCounts.length > 0 && (
                <section className="rounded-2xl border border-[#1D2638] bg-[#121826] p-5 space-y-3.5">
                  <h2 className="text-base font-semibold text-[#EDE6D8]">
                    {tr(UI.library.chartTriggers, lang)}
                  </h2>
                  <div className="space-y-3">
                    {stats.triggerCounts.slice(0, 6).map((item) => {
                      const pct = Math.round((item.count / maxTriggerCount) * 100);
                      return (
                        <div key={item.tag} className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-[#EDE6D8]">{item.tag}</span>
                            <span className="font-mono text-[#8892A4] tabular-nums">
                              {item.count}
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-[#1A2233]">
                            <div
                              className="h-2 rounded-full bg-[#5C7FB8]"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Mood over time */}
              {stats.moodSeries.length > 0 && (
                <section className="rounded-2xl border border-[#1D2638] bg-[#121826] p-5 space-y-3">
                  <h2 className="text-base font-semibold text-[#EDE6D8]">
                    {tr(UI.library.chartMood, lang)}
                  </h2>
                  <MoodLineSvg series={stats.moodSeries} />
                </section>
              )}
            </>
          )}

          {/* User-defined local reminder schedule */}
          <section className="rounded-2xl border border-[#1D2638] bg-[#121826] p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-[#9DB4E0]" aria-hidden="true" />
              <h2 className="text-base font-semibold text-[#EDE6D8]">
                {tr(UI.library.reminderTitle, lang)}
              </h2>
            </div>
            <p className="text-xs text-[#8892A4] leading-relaxed">
              {tr(UI.library.reminderDesc, lang)}
            </p>
            <form onSubmit={handleReminderSave} className="space-y-3">
              <label className="flex items-center justify-between gap-3 rounded-xl border border-[#27324A] bg-[#0F1522] px-4 py-2.5 cursor-pointer min-h-[44px]">
                <span className="text-sm text-[#EDE6D8]">
                  {lang === 'cs' ? 'Aktivní vlastní připomínka' : 'Active personal reminder'}
                </span>
                <input
                  type="checkbox"
                  checked={remEnabled}
                  onChange={(e) => setRemEnabled(e.target.checked)}
                  className="h-5 w-5 accent-[#8A9A86]"
                />
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                <select
                  value={remDay}
                  onChange={(e) => setRemDay(Number(e.target.value))}
                  aria-label={lang === 'cs' ? 'Den v týdnu' : 'Day of week'}
                  className="min-h-[44px] rounded-xl border border-[#27324A] bg-[#0F1522] px-3 text-sm text-[#EDE6D8]"
                >
                  {(lang === 'cs' ? DAYS_CS : DAYS_EN).map((dayName, idx) => (
                    <option key={dayName} value={idx}>
                      {dayName}
                    </option>
                  ))}
                </select>
                <input
                  type="time"
                  value={remTime}
                  onChange={(e) => setRemTime(e.target.value)}
                  aria-label={lang === 'cs' ? 'Čas' : 'Time'}
                  className="min-h-[44px] rounded-xl border border-[#27324A] bg-[#0F1522] px-3 text-sm font-mono text-[#EDE6D8]"
                />
              </div>

              <input
                type="text"
                value={remLabel}
                onChange={(e) => setRemLabel(e.target.value)}
                placeholder={
                  lang === 'cs'
                    ? 'Např. Připomeň můj plán před víkendem'
                    : 'E.g. Remind me of my plan before the weekend'
                }
                aria-label={tr(UI.library.reminderTitle, lang)}
                className="min-h-[44px] w-full rounded-xl border border-[#27324A] bg-[#0F1522] px-3.5 text-sm text-[#EDE6D8] placeholder:text-[#8892A4]/70"
              />

              <button
                type="submit"
                className="min-h-[46px] w-full rounded-full border border-[#2C3A54] bg-[#0F1522] text-sm font-medium text-[#9DB4E0] hover:border-[#5C7FB8]"
              >
                {lang === 'cs' ? 'Uložit připomínku' : 'Save reminder'}
              </button>
              {remSaved && (
                <p role="status" className="text-center text-xs text-[#8A9A86]">
                  {lang === 'cs' ? 'Připomínka uložena lokálně.' : 'Reminder saved locally.'}
                </p>
              )}
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

const MoodLineSvg: React.FC<{ series: { date: string; mood: number }[] }> = ({ series }) => {
  const w = 320;
  const h = 154;
  const padX = 24;
  const padTop = 14;
  const padBottom = 26;
  const usableW = w - padX * 2;
  const usableH = h - padTop - padBottom;

  const points = series.map((item, idx) => {
    const x = series.length === 1 ? w / 2 : padX + (idx * usableW) / (series.length - 1);
    const y = padTop + ((5 - item.mood) / 4) * usableH;
    return { x, y, date: item.date.slice(5), mood: item.mood };
  });

  const polyline = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const firstLabel = points[0]?.date ?? '';
  const lastLabel = points[points.length - 1]?.date ?? '';

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Mood over time">
      {[1, 2, 3, 4, 5].map((level) => {
        const y = padTop + ((5 - level) / 4) * usableH;
        return (
          <g key={level}>
            <line x1={padX} y1={y} x2={w - padX} y2={y} stroke="#1D2638" strokeWidth="1" />
            <text x={6} y={y + 4} fill="#8892A4" fontSize="10" fontFamily="JetBrains Mono, monospace">
              {level}
            </text>
          </g>
        );
      })}
      {points.length > 1 && (
        <polyline
          fill="none"
          stroke="#9DB4E0"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={polyline}
        />
      )}
      {points.map((p, idx) => (
        <circle key={idx} cx={p.x} cy={p.y} r="4" fill="#8A9A86" stroke="#0B0F17" strokeWidth="1.5" />
      ))}
      {points.length === 1 ? (
        <text
          x={w / 2}
          y={h - 6}
          textAnchor="middle"
          fill="#8892A4"
          fontSize="10"
          fontFamily="JetBrains Mono, monospace"
        >
          {firstLabel}
        </text>
      ) : (
        <>
          <text
            x={padX}
            y={h - 6}
            textAnchor="start"
            fill="#8892A4"
            fontSize="10"
            fontFamily="JetBrains Mono, monospace"
          >
            {firstLabel}
          </text>
          <text
            x={w - padX}
            y={h - 6}
            textAnchor="end"
            fill="#8892A4"
            fontSize="10"
            fontFamily="JetBrains Mono, monospace"
          >
            {lastLabel}
          </text>
        </>
      )}
    </svg>
  );
};

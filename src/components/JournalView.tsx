import React, { useEffect, useState } from 'react';
import { Lock, Trash2 } from 'lucide-react';
import type { AppState, TrustedContact } from '../types/app';
import { COMMUNITY_REASONS, JOURNAL_PROMPTS } from '../data/content';
import { tr, UI } from '../data/uiStrings';
import { todayKey } from '../utils/stateLogic';

interface JournalViewProps {
  state: AppState;
  onChangeSegment: (seg: 'notes' | 'reasons') => void;
  onSaveNote: (dateKey: string, displayDate: string, text: string) => void;
  onAddReason: (reason: string) => void;
  onRemoveReason: (index: number) => void;
  onSavePlan: (plan: string) => void;
  onSaveContact: (contact: TrustedContact) => void;
}

export const JournalView: React.FC<JournalViewProps> = ({
  state,
  onChangeSegment,
  onSaveNote,
  onAddReason,
  onRemoveReason,
  onSavePlan,
  onSaveContact,
}) => {
  const lang = state.lang;
  const today = todayKey();
  const [selectedDay, setSelectedDay] = useState(today);
  const currentEntry = state.notes.find((n) => n.k === selectedDay);
  const [noteText, setNoteText] = useState(currentEntry?.x ?? '');
  const [reasonInput, setReasonInput] = useState('');
  const [planInput, setPlanInput] = useState(state.ifThenPlan);
  const [contactName, setContactName] = useState(state.trustedContact.name);
  const [contactPhone, setContactPhone] = useState(state.trustedContact.phone);
  const [savedFlag, setSavedFlag] = useState<string | null>(null);

  useEffect(() => {
    const entry = state.notes.find((n) => n.k === selectedDay);
    setNoteText(entry?.x ?? '');
  }, [selectedDay, state.notes]);

  useEffect(() => {
    setPlanInput(state.ifThenPlan);
  }, [state.ifThenPlan]);

  useEffect(() => {
    setContactName(state.trustedContact.name);
    setContactPhone(state.trustedContact.phone);
  }, [state.trustedContact]);

  const formatDateLabel = (key: string, fallback?: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return fallback || key;
    try {
      return new Date(`${key}T12:00:00`).toLocaleDateString(lang === 'cs' ? 'cs-CZ' : 'en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
    } catch {
      return key;
    }
  };

  const flash = (key: string) => {
    setSavedFlag(key);
    window.setTimeout(() => setSavedFlag(null), 2200);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    onSaveNote(selectedDay, formatDateLabel(selectedDay), noteText);
    flash('note');
  };

  const handleAddReason = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reasonInput.trim()) return;
    onAddReason(reasonInput.trim());
    setReasonInput('');
    flash('reason');
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePlan(planInput.trim());
    flash('plan');
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveContact({ name: contactName.trim(), phone: contactPhone.trim() });
    flash('contact');
  };

  const pastNotes = state.notes.filter((n) => n.k !== selectedDay);
  const isToday = selectedDay === today;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl sm:text-3xl font-semibold text-[#EDE6D8]">
        {tr(UI.journal.title, lang)}
      </h1>

      {/* Segmented control */}
      <div role="tablist" className="flex rounded-2xl border border-[#1D2638] bg-[#0F1522] p-1">
        <button
          type="button"
          role="tab"
          aria-selected={state.seg.journal === 'notes'}
          onClick={() => onChangeSegment('notes')}
          className={`min-h-[42px] flex-1 rounded-xl text-sm font-medium ${
            state.seg.journal === 'notes'
              ? 'bg-[#1B2540] text-[#9DB4E0]'
              : 'text-[#8892A4] hover:text-[#EDE6D8]'
          }`}
        >
          {tr(UI.journal.segNotes, lang)}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={state.seg.journal === 'reasons'}
          onClick={() => onChangeSegment('reasons')}
          className={`min-h-[42px] flex-1 rounded-xl text-sm font-medium ${
            state.seg.journal === 'reasons'
              ? 'bg-[#1B2540] text-[#9DB4E0]'
              : 'text-[#8892A4] hover:text-[#EDE6D8]'
          }`}
        >
          {tr(UI.journal.segReasons, lang)}
        </button>
      </div>

      {/* Device-local indicator */}
      <div className="flex items-center gap-2 text-xs text-[#9DB4E0]">
        <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>{tr(UI.journal.localBadge, lang)}</span>
      </div>

      {state.seg.journal === 'notes' ? (
        <div className="space-y-5">
          <form onSubmit={handleSaveNote} className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="daily-note-area" className="text-sm font-medium text-[#8892A4]">
                {isToday ? tr(UI.journal.noteToday, lang) : formatDateLabel(selectedDay, currentEntry?.d)}
              </label>
              {!isToday && (
                <button
                  type="button"
                  onClick={() => setSelectedDay(today)}
                  className="text-xs font-medium text-[#9DB4E0] hover:underline"
                >
                  {tr(UI.journal.backToToday, lang)}
                </button>
              )}
            </div>

            {/* Optional fixed prompts */}
            <div className="space-y-1.5">
              <span className="block text-xs text-[#8892A4]">{tr(UI.journal.promptsLabel, lang)}</span>
              <div className="flex flex-wrap gap-2">
                {JOURNAL_PROMPTS.map((p, idx) => {
                  const txt = tr(p, lang);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() =>
                        setNoteText((prev) => (prev.trim() ? `${prev.trim()}\n\n${txt}\n` : `${txt}\n`))
                      }
                      className="min-h-[38px] rounded-xl border border-[#27324A] bg-[#0F1522] px-3 py-1.5 text-xs text-[#8892A4] hover:text-[#EDE6D8] text-left"
                    >
                      {txt}
                    </button>
                  );
                })}
              </div>
            </div>

            <textarea
              id="daily-note-area"
              rows={6}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder={tr(UI.journal.notePh, lang)}
              className="w-full rounded-2xl border border-[#27324A] bg-[#0F1522] p-4 text-[15px] leading-relaxed text-[#EDE6D8] placeholder:text-[#8892A4]/70 resize-y"
            />

            <button
              type="submit"
              className="min-h-[50px] w-full rounded-full bg-[#8A9A86] px-6 text-base font-semibold text-[#0B0F17] transition hover:bg-[#9BAA97]"
            >
              {tr(UI.journal.saveNote, lang)}
            </button>
            {savedFlag === 'note' && (
              <p role="status" className="text-center text-xs text-[#8A9A86]">
                {lang === 'cs' ? 'Poznámka uložena.' : 'Entry saved.'}
              </p>
            )}
          </form>

          <p className="text-xs text-[#8892A4]">{tr(UI.journal.noteHint, lang)}</p>

          {pastNotes.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <h2 className="text-base font-semibold text-[#EDE6D8]">
                {tr(UI.journal.earlierDays, lang)}
              </h2>
              <div className="space-y-2.5">
                {pastNotes.map((note) => (
                  <button
                    key={note.k}
                    type="button"
                    onClick={() => setSelectedDay(note.k)}
                    className="w-full rounded-2xl border border-[#1D2638] bg-[#121826] p-4 text-left transition hover:border-[#5C7FB8] space-y-1"
                  >
                    <div className="text-xs text-[#8892A4]">
                      {formatDateLabel(note.k, note.d)}
                    </div>
                    <p className="text-sm text-[#EDE6D8] line-clamp-3 whitespace-pre-line">
                      {note.x}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {/* My Reasons */}
          <section className="rounded-2xl border border-[#1D2638] bg-[#121826] p-5 space-y-4">
            <h2 className="text-lg font-semibold text-[#EDE6D8]">
              {tr(UI.journal.reasonsTitle, lang)}
            </h2>

            <form onSubmit={handleAddReason} className="space-y-3">
              <textarea
                rows={2}
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                placeholder={tr(UI.journal.reasonsPh, lang)}
                aria-label={tr(UI.journal.reasonsTitle, lang)}
                className="w-full rounded-xl border border-[#27324A] bg-[#0F1522] p-3.5 text-sm text-[#EDE6D8] placeholder:text-[#8892A4]/70"
              />
              <button
                type="submit"
                className="min-h-[48px] w-full rounded-full bg-[#8A9A86] px-5 text-sm font-semibold text-[#0B0F17]"
              >
                {tr(UI.journal.saveReason, lang)}
              </button>
            </form>

            {state.reasons.length > 0 && (
              <ul className="space-y-2 pt-1">
                {state.reasons.map((r, idx) => (
                  <li
                    key={idx}
                    className="flex items-start justify-between gap-3 rounded-xl border border-[#1D2638] bg-[#0F1522] p-3.5"
                  >
                    <span className="text-sm text-[#EDE6D8] leading-relaxed">{r}</span>
                    <button
                      type="button"
                      onClick={() => onRemoveReason(idx)}
                      aria-label={`${tr(UI.journal.remove, lang)} ${r}`}
                      className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center text-[#8892A4] hover:text-[#EDE6D8] shrink-0"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="space-y-2 pt-2 border-t border-[#1D2638]">
              <div className="text-xs font-medium text-[#8892A4]">
                {tr(UI.journal.othersReasons, lang)}
              </div>
              <div className="space-y-2">
                {COMMUNITY_REASONS.map((item, idx) => {
                  const text = tr(item, lang);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setReasonInput(text)}
                      className="min-h-[44px] w-full rounded-xl border border-[#27324A] bg-[#0F1522] px-3.5 py-2.5 text-left text-sm text-[#EDE6D8]/90 hover:border-[#5C7FB8]"
                    >
                      {text}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* My Plan: If X, then Y */}
          <section className="rounded-2xl border border-[#1D2638] bg-[#121826] p-5 space-y-3">
            <h2 className="text-lg font-semibold text-[#EDE6D8]">
              {tr(UI.journal.planTitle, lang)}
            </h2>
            <form onSubmit={handleSavePlan} className="space-y-3">
              <textarea
                rows={3}
                value={planInput}
                onChange={(e) => setPlanInput(e.target.value)}
                placeholder={tr(UI.journal.planPh, lang)}
                aria-label={tr(UI.journal.planTitle, lang)}
                className="w-full rounded-xl border border-[#27324A] bg-[#0F1522] p-3.5 text-sm text-[#EDE6D8] placeholder:text-[#8892A4]/70"
              />
              <button
                type="submit"
                className="min-h-[46px] w-full rounded-full border border-[#2C3A54] bg-[#0F1522] text-sm font-medium text-[#9DB4E0] hover:border-[#5C7FB8]"
              >
                {tr(UI.journal.savePlan, lang)}
              </button>
              {savedFlag === 'plan' && (
                <p role="status" className="text-center text-xs text-[#8A9A86]">
                  {lang === 'cs' ? 'Plán uložen.' : 'Plan saved.'}
                </p>
              )}
            </form>
          </section>

          {/* Trusted Contact */}
          <section className="rounded-2xl border border-[#1D2638] bg-[#121826] p-5 space-y-3">
            <h2 className="text-lg font-semibold text-[#EDE6D8]">
              {tr(UI.journal.contactTitle, lang)}
            </h2>
            <form onSubmit={handleSaveContact} className="space-y-3">
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder={tr(UI.journal.contactNamePh, lang)}
                aria-label={tr(UI.journal.contactNamePh, lang)}
                className="min-h-[44px] w-full rounded-xl border border-[#27324A] bg-[#0F1522] px-3.5 text-sm text-[#EDE6D8] placeholder:text-[#8892A4]/70"
              />
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder={tr(UI.journal.contactPhonePh, lang)}
                aria-label={tr(UI.journal.contactPhonePh, lang)}
                className="min-h-[44px] w-full rounded-xl border border-[#27324A] bg-[#0F1522] px-3.5 text-sm text-[#EDE6D8] placeholder:text-[#8892A4]/70"
              />
              <button
                type="submit"
                className="min-h-[46px] w-full rounded-full border border-[#2C3A54] bg-[#0F1522] text-sm font-medium text-[#9DB4E0] hover:border-[#5C7FB8]"
              >
                {tr(UI.journal.saveContact, lang)}
              </button>
              {savedFlag === 'contact' && (
                <p role="status" className="text-center text-xs text-[#8A9A86]">
                  {lang === 'cs' ? 'Kontakt uložen.' : 'Contact saved.'}
                </p>
              )}
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

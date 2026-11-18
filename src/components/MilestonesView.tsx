import React from 'react';
import type { Lang, StoneId } from '../types/app';
import { STONES_META } from '../data/content';
import { tr, UI } from '../data/uiStrings';
import { StoneArt } from './StoneArt';

interface MilestonesViewProps {
  lang: Lang;
  unlockedStones: StoneId[];
}

export const MilestonesView: React.FC<MilestonesViewProps> = ({ lang, unlockedStones }) => {
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#EDE6D8]">
          {tr(UI.milestones.title, lang)}
        </h1>
        <p className="text-sm text-[#8892A4] leading-relaxed">{tr(UI.milestones.sub, lang)}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
        {STONES_META.map((stone) => {
          const unlocked = unlockedStones.includes(stone.id);
          return (
            <div
              key={stone.id}
              className={`rounded-2xl border border-[#1D2638] bg-[#121826] p-5 text-center transition ${
                unlocked ? 'opacity-100' : 'opacity-50'
              }`}
            >
              <div className="mb-3">
                <StoneArt id={stone.id} unlocked={unlocked} />
              </div>
              <h2 className="text-sm font-semibold text-[#EDE6D8]">{tr(stone.title, lang)}</h2>
              <p className="mt-1 text-xs text-[#8892A4] leading-snug">
                {unlocked ? tr(stone.desc, lang) : tr(UI.milestones.lockedDot, lang)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Download, Share, Smartphone } from 'lucide-react';
import type { Lang } from '../types/app';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallControlProps {
  lang: Lang;
  compact?: boolean;
}

export const PWAInstallControl: React.FC<PWAInstallControlProps> = ({ lang, compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    if (compact) return null;
    return (
      <p className="text-sm text-[#8A9A86]">
        {lang === 'cs'
          ? 'Aplikace je nainstalovaná v samostatném režimu a funguje i offline.'
          : 'App is installed in standalone mode and works offline.'}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {isInstallable && (
        <button
          type="button"
          onClick={() => void install()}
          className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#8A9A86] px-4 py-2.5 text-sm font-semibold text-[#0B0F17] transition hover:bg-[#9BAA97] whitespace-nowrap shrink-0"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          {lang === 'cs' ? 'Nainstalovat na plochu' : 'Install app'}
        </button>
      )}

      {(!isInstallable || isIOS || !compact) && (
        <button
          type="button"
          onClick={() => setShowGuide((prev) => !prev)}
          className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-[#2C3A54] bg-[#0F1522] px-3 py-2 text-xs font-medium text-[#9DB4E0] transition hover:border-[#5C7FB8]"
        >
          <Smartphone className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="truncate">
            {compact
              ? lang === 'cs'
                ? 'Instalace PWA'
                : 'Install PWA'
              : isIOS
                ? lang === 'cs'
                  ? 'Jak přidat na iPhone'
                  : 'Install on iPhone'
                : lang === 'cs'
                  ? 'Návod k instalaci (iOS / Android)'
                  : 'Install guide (iOS / Android)'}
          </span>
        </button>
      )}

      {showGuide && (
        <div className="rounded-xl border border-[#1D2638] bg-[#0F1522] p-4 text-sm text-[#EDE6D8] space-y-2.5">
          <div className="flex items-center gap-2 font-medium text-[#9DB4E0]">
            <Share className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              {lang === 'cs' ? 'Postup pro iPhone / iPad (Safari)' : 'iPhone / iPad (Safari)'}
            </span>
          </div>
          <ol className="list-decimal space-y-1.5 pl-5 text-[#EDE6D8]/90 leading-relaxed">
            <li>
              {lang === 'cs'
                ? 'Otevři tuto stránku v prohlížeči Safari.'
                : 'Open this page in Safari.'}
            </li>
            <li>
              {lang === 'cs'
                ? 'Klepni na tlačítko Sdílet (čtverec se šipkou nahoru) ve spodní liště.'
                : 'Tap the Share button (square with upward arrow) in the toolbar.'}
            </li>
            <li>
              {lang === 'cs'
                ? 'Posuň nabídku dolů a vyber „Přidat na plochu“.'
                : 'Scroll down and tap "Add to Home Screen".'}
            </li>
          </ol>
          <p className="text-xs text-[#8892A4] leading-relaxed">
            {lang === 'cs'
              ? 'Poznámka pro iOS: Nainstalovaná ikona má vlastní oddělené úložiště od Safari. Pokud už máš zápisy v Safari, přenes je přes Šifrovanou zálohu.'
              : 'iOS note: The installed Home Screen app keeps separate storage from Safari. Export an encrypted backup to move existing entries.'}
          </p>
        </div>
      )}
    </div>
  );
};

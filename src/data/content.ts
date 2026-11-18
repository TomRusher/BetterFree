import type { BilingualText, SosCategoryId, StoneId } from '../types/app';

export interface ArticleItem {
  id: string;
  title: BilingualText;
  readTime: BilingualText;
  summary: BilingualText;
  paragraphs: BilingualText[];
}

export interface SosTechnique {
  id: string;
  category: Exclude<SosCategoryId, 'plan' | 'people'>;
  durationMin: 2 | 10 | 20;
  title: BilingualText;
  description: BilingualText;
  safetyNote?: BilingualText;
  hasBreathingGuide?: boolean;
}

export interface WeeklyExperimentDef {
  id: string;
  title: BilingualText;
  detail: BilingualText;
}

export const DEFAULT_TRIGGERS: { id: string; label: BilingualText }[] = [
  { id: 'stres', label: { cs: 'Stres', en: 'Stress' } },
  { id: 'nuda', label: { cs: 'Nuda', en: 'Boredom' } },
  { id: 'osamelost', label: { cs: 'Osamělost', en: 'Loneliness' } },
  { id: 'unava', label: { cs: 'Únava', en: 'Fatigue' } },
  { id: 'vecer', label: { cs: 'Večer o samotě', en: 'Evening alone' } },
  { id: 'scrollovani', label: { cs: 'Scrollování', en: 'Scrolling' } },
];

export const EMOTION_TAGS: { id: string; label: BilingualText }[] = [
  { id: 'klid', label: { cs: 'Klid', en: 'Calm' } },
  { id: 'napeti', label: { cs: 'Napětí', en: 'Tension' } },
  { id: 'energie', label: { cs: 'Energie', en: 'Energy' } },
  { id: 'unava', label: { cs: 'Únava', en: 'Tired' } },
  { id: 'vděk', label: { cs: 'Vděčnost', en: 'Grateful' } },
  { id: 'nejistota', label: { cs: 'Nejistota', en: 'Uncertain' } },
];

export const JOURNAL_PROMPTS: BilingualText[] = [
  { cs: 'Co mi dnes pomohlo zůstat v klidu?', en: 'What helped me stay steady today?' },
  { cs: 'Jaký spouštěč se dnes objevil a jak jsem reagoval?', en: 'What trigger showed up today and how did I respond?' },
  { cs: 'Za jakou drobnou věc dneška jsem vděčný?', en: 'What small part of today am I grateful for?' },
];

export const COMMUNITY_REASONS: BilingualText[] = [
  {
    cs: 'Mít ráno čistou hlavu a opravdové soustředění na věci, na kterých mi záleží.',
    en: 'Waking up with a clear head and genuine focus for what I care about.',
  },
  {
    cs: 'Být plně přítomný ve skutečných rozhovorech a vztazích.',
    en: 'Being fully present in real conversations and relationships.',
  },
  {
    cs: 'Přestat trávit pozdní večery v mlze únavy a pak litovat ztraceného spánku.',
    en: 'Stopping late-night scrolling fatigue and protecting restful sleep.',
  },
  {
    cs: 'Cítit se ve vlastním těle a dni klidněji a svobodněji.',
    en: 'Feeling steadier and freer in my own day.',
  },
];

export const WEEKLY_EXPERIMENTS: WeeklyExperimentDef[] = [
  {
    id: 'phone-outside',
    title: { cs: 'Telefon mimo ložnici', en: 'Phone outside bedroom' },
    detail: {
      cs: 'Nechat telefon na noc nabíjet v jiné místnosti a použít obyčejný budík.',
      en: 'Charge the phone in another room overnight and use a simple alarm clock.',
    },
  },
  {
    id: 'evening-winddown',
    title: { cs: 'Večerní zklidnění', en: 'Evening wind-down' },
    detail: {
      cs: '30 minut před spaním odložit obrazovky (kniha, sprcha, čaj).',
      en: 'Put screens away 30 minutes before sleep (book, shower, tea).',
    },
  },
  {
    id: 'daily-walk',
    title: { cs: 'Krátký denní pohyb', en: 'Brief daily movement' },
    detail: {
      cs: 'Minimálně 15 minut chůze venku nebo protažení bez sluchátek.',
      en: 'At least 15 minutes walking outside or stretching without headphones.',
    },
  },
  {
    id: 'content-filter',
    title: { cs: 'Zapnutý filtr obsahu', en: 'Content filter enabled' },
    detail: {
      cs: 'Nastavit si v prohlížeči nebo routeru základní filtr, který přidá tření.',
      en: 'Keep a basic DNS or browser filter active to add simple friction.',
    },
  },
  {
    id: 'pause-before-feed',
    title: { cs: 'Pauza před sociálními sítěmi', en: 'Pause before opening feeds' },
    detail: {
      cs: 'Před otevřením nekonečného feedu se třikrát klidně nadechnout.',
      en: 'Take three slow breaths before opening any infinite scroll feed.',
    },
  },
];

export const ARTICLES: ArticleItem[] = [
  {
    id: 'habit-loop',
    title: { cs: 'Jak fungují návykové smyčky', en: 'How habit loops work' },
    readTime: { cs: '3 min čtení', en: '3 min read' },
    summary: {
      cs: 'Návyk se obvykle skládá ze spouštěče, automatické reakce a krátkodobé úlevy od napětí.',
      en: 'A habit usually runs through a cue, an automatic routine, and short-lived relief.',
    },
    paragraphs: [
      {
        cs: 'Když se nějaký zvyk opakuje měsíce nebo roky, mozek si z něj udělá zkratku. Stačí známý spouštěč — třeba večerní ticho, únava po práci nebo bezcílné listování v telefonu — a objeví se silný impuls.',
        en: 'When a routine repeats over months, the brain builds a shortcut. A familiar cue—evening quiet, post-work fatigue, or aimless scrolling—can trigger a sudden impulse.',
      },
      {
        cs: 'Užitečná změna nezačíná výčitkami, ale všímavostí: všimnout si spouštěče dřív, než se rozjede automatické jednání, a vložit mezi podnět a reakci krátkou pauzu.',
        en: 'Helpful change rarely starts with guilt. It starts by noticing the cue earlier and placing a brief pause between the cue and the automatic action.',
      },
    ],
  },
  {
    id: 'urge-surfing',
    title: { cs: 'Urge surfing: pozorování vlny', en: 'Urge surfing: watching the wave' },
    readTime: { cs: '3 min čtení', en: '3 min read' },
    summary: {
      cs: 'Nutkání se chová jako vlna: zvedne se, dosáhne vrcholu a když ho nekrmíš ani s ním nebojuješ, zase opadne.',
      en: 'An urge behaves like a wave: it rises, crests, and subsides when you neither feed nor fight it.',
    },
    paragraphs: [
      {
        cs: 'Mnoho lidí má pocit, že pokud nutkání neuposlechnou, bude růst donekonečna. Ve skutečnosti má každá jednotlivá vlna omezenou délku — často několik minut.',
        en: 'Many people fear an urge will escalate endlessly unless obeyed. In practice, an individual wave crests and settles within minutes when left alone.',
      },
      {
        cs: 'Při pozorování vlny pomáhá přesunout pozornost z myšlenek do tělesných vjemů: kde cítíš napětí, jak dýcháš a co se děje kolem tebe právě teď.',
        en: 'Surfing an urge means shifting attention from racing thoughts to physical sensations: noticing tension, breath, and your immediate surroundings.',
      },
    ],
  },
  {
    id: 'sleep-screens',
    title: { cs: 'Spánek, únava a noční obrazovky', en: 'Sleep, fatigue, and late screens' },
    readTime: { cs: '2 min čtení', en: '2 min read' },
    summary: {
      cs: 'Nevyspalost oslabuje soustředění i schopnost zastavit automatický zvyk v pozdních hodinách.',
      en: 'Sleep debt lowers focus and makes late-night automatic habits much harder to pause.',
    },
    paragraphs: [
      {
        cs: 'Večer bývá únava nejvyšší a seberegulace nejslabší. Obrazovka v posteli udržuje pozornost v pohotovosti a oddaluje spánek.',
        en: 'Late in the evening tiredness peaks while self-regulation dips. Taking screens into bed keeps alertness elevated and delays real rest.',
      },
      {
        cs: 'Jednoduché praktické pravidlo — například nechat telefon nabíjet mimo postel — funguje spolehlivěji než spoléhání na pevné odhodlání o půlnoci.',
        en: 'A simple environmental rule—such as charging your phone across the room or outside the bedroom—works far better than midnight willpower.',
      },
    ],
  },
  {
    id: 'digital-friction',
    title: { cs: 'Úprava digitálního prostředí', en: 'Shaping your digital environment' },
    readTime: { cs: '3 min čtení', en: '3 min read' },
    summary: {
      cs: 'Malé tření mezi impulsem a obsahem dává vědomé volbě čas se ozvat.',
      en: 'Small friction between an impulse and a screen gives conscious choice time to catch up.',
    },
    paragraphs: [
      {
        cs: 'Nemusíš instalovat invazivní nástroje, které sbírají data. Stačí jednoduché překážky: odhlásit se z rizikových účtů, skrýt ikony prohlížeče nebo vypnout noční upozornění.',
        en: 'You don’t need invasive tracking tools. Simple friction works: log out of trigger apps, enable greyscale at night, or silence non-essential alerts.',
      },
      {
        cs: 'Každých deset sekund navíc, než se k něčemu dostaneš, je prostor, ve kterém se můžeš zvednout a změnit místnost.',
        en: 'Every extra ten seconds of friction creates breathing room to stand up and switch environments.',
      },
    ],
  },
  {
    id: 'after-slip',
    title: { cs: 'Co dělat po uklouznutí', en: 'What to do after a slip' },
    readTime: { cs: '3 min čtení', en: '3 min read' },
    summary: {
      cs: 'Stud a pocit, že „všechno je ztraceno“, bývají hlavním spouštěčem dalšího uklouznutí.',
      en: 'Shame and an "all-or-nothing" mindset often trigger further slips more than the initial moment itself.',
    },
    paragraphs: [
      {
        cs: 'Jedno uklouznutí nevymaže věci, které ses o sobě naučil, ani tvé tiché kameny. Nejsi zpátky na nule.',
        en: 'One slip does not erase what you have learned about your triggers, nor your silent stones. You are not back at zero.',
      },
      {
        cs: 'Místo sebekritiky si v klidu zapiš fakta: kdy to přišlo, co tomu předcházelo a jak jsi unavený. Věcná informace je užitečnější než trest.',
        en: 'Instead of harsh self-criticism, note the plain facts: time of day, what preceded it, and your energy level. Neutral observation beats self-punishment.',
      },
    ],
  },
  {
    id: 'hidden-needs',
    title: { cs: 'Únava, stres a osamělost', en: 'Fatigue, stress, and loneliness' },
    readTime: { cs: '2 min čtení', en: '2 min read' },
    summary: {
      cs: 'Často nehledáme samotný návyk, ale rychlý únik od nepohodlí nebo samoty.',
      en: 'Often we aren’t seeking the habit itself, but quick relief from discomfort or loneliness.',
    },
    paragraphs: [
      {
        cs: 'Když se naučíš rozlišit mezi skutečnou chutí a signálem „jsem vyčerpaný“ nebo „jsem celý den sám“, otevřou se jiné možnosti reakce.',
        en: 'Learning to tell the difference between an urge and a signal of exhaustion or isolation opens practical alternatives.',
      },
      {
        cs: 'Někdy nejvíc pomůže krátký hovor s kamarádem, teplé jídlo nebo dvacet minut spánku.',
        en: 'Sometimes a brief call with a friend, a warm meal, or resting for twenty minutes addresses the real need directly.',
      },
    ],
  },
  {
    id: 'when-seek-help',
    title: { cs: 'Kdy vyhledat odbornou pomoc', en: 'When to seek professional support' },
    readTime: { cs: '2 min čtení', en: '2 min read' },
    summary: {
      cs: 'Osobní aplikace má své hranice. Pokud návyk zásadně narušuje život nebo přináší silnou tíseň, je rozhovor s odborníkem síla, ne slabost.',
      en: 'A personal self-help tool has limits. If a habit disrupts daily life or brings heavy distress, talking to a professional is a strong step.',
    },
    paragraphs: [
      {
        cs: 'Zvaž osobní konzultaci s psychologem, psychoterapeutem nebo adiktologem zejména tehdy, pokud se cítíš dlouhodobě bezmocný, zažíváš úzkosti, deprese nebo ti návyk poškozuje vztahy a práci.',
        en: 'Consider speaking with a psychologist or counselor especially if you feel persistent distress, anxiety, low mood, or harm to relationships and work.',
      },
      {
        cs: 'Kontakty na bezplatnou krizovou pomoc najdeš kdykoli přímo v sekci SOS pod odkazem „Potřebuji víc než tip“.',
        en: 'Free support contacts are always one tap away inside the SOS section under "Need more than a tip".',
      },
    ],
  },
  {
    id: 'privacy-model',
    title: { cs: 'Jak BetterFree chrání soukromí', en: 'How BetterFree protects privacy' },
    readTime: { cs: '2 min čtení', en: '2 min read' },
    summary: {
      cs: 'Aplikace nemá server, účty ani analytiku. Data zůstávají v zařízení a můžeš si je zašifrovat.',
      en: 'No servers, accounts, or analytics exist here. Your entries stay on your device and can be encrypted for backup.',
    },
    paragraphs: [
      {
        cs: 'Všechny poznámky, nálady i záznamy nutkání se ukládají lokálně v úložišti tvého prohlížeče. Aplikace funguje i v letovém režimu.',
        en: 'All notes, mood check-ins, and urge logs are saved locally in your browser storage. The app works fully offline.',
      },
      {
        cs: 'Pro větší soukromí si v Nastavení zapni PIN zámek a občas si stáhni šifrovanou zálohu.',
        en: 'For extra privacy, enable the PIN lock in Settings and export an encrypted backup whenever you change devices.',
      },
    ],
  },
];

export const SOS_TILES: {
  id: SosCategoryId;
  title: BilingualText;
  subtitle: BilingualText;
}[] = [
  {
    id: 'plan',
    title: { cs: 'Můj plán', en: 'My plan' },
    subtitle: { cs: 'Předem napsané pravidlo „když X, tak Y“', en: 'Your pre-written "If X, then Y" rule' },
  },
  {
    id: 'move',
    title: { cs: 'Pohyb a změna místa', en: 'Movement & place shift' },
    subtitle: { cs: 'Krátká fyzická změna prostředí', en: 'Brief physical change of setting' },
  },
  {
    id: 'breath',
    title: { cs: 'Dech a tělo', en: 'Breath & body' },
    subtitle: { cs: 'Zklidnění dechu a tělesné ukotvení', en: 'Calming breath and physical grounding' },
  },
  {
    id: 'focus',
    title: { cs: 'Odpoutání pozornosti', en: 'Shift attention' },
    subtitle: { cs: 'Smyslové a praktické kroky na pár minut', en: 'Grounding and hands-on focus steps' },
  },
  {
    id: 'people',
    title: { cs: 'Lidé', en: 'People' },
    subtitle: { cs: 'Spojit se jedním klepnutím s blízkou osobou', en: 'Reach a trusted person in one tap' },
  },
];

export const SOS_TECHNIQUES: SosTechnique[] = [
  {
    id: 'walk-out',
    category: 'move',
    durationMin: 10,
    title: { cs: 'Vyjít na 5–10 minut ven', en: 'Step outside for 5–10 minutes' },
    description: {
      cs: 'Nech telefon v kapse nebo doma. Projdi se kolem bloku a všímej si tří zvuků, tří barev a teploty vzduchu na tváři.',
      en: 'Leave your phone in your pocket or at home. Walk around the block and notice three sounds, three colors, and the air on your skin.',
    },
  },
  {
    id: 'change-room',
    category: 'move',
    durationMin: 2,
    title: { cs: 'Změnit místnost a polohu', en: 'Change rooms & posture' },
    description: {
      cs: 'Vstaň okamžitě ze židle nebo postele, přejdi do kuchyně či obýváku a otevři okno dokořán.',
      en: 'Stand up immediately from your chair or bed, move to another room, and open a window wide.',
    },
  },
  {
    id: 'pushups-stretch',
    category: 'move',
    durationMin: 2,
    title: { cs: '20 dřepů nebo kliků a protažení', en: '20 squats or pushups & stretch' },
    description: {
      cs: 'Krátké zapojení velkých svalů odvede nahromaděné napětí. Pak desetkrát pomalu zakruž rameny.',
      en: 'Brief large-muscle movement releases built-up tension. Follow with ten slow shoulder rolls.',
    },
  },
  {
    id: 'tidy-hands',
    category: 'move',
    durationMin: 10,
    title: { cs: 'Jedna konkrétní věc rukama', en: 'One small task with your hands' },
    description: {
      cs: 'Umyj nádobí ve dřezu, srovnej stůl nebo vynes koš. Zaměstnat ruce v reálném prostoru rychle mění kontext.',
      en: 'Wash a mug, clear your desk, or take out the trash. Using your hands in physical space shifts your context quickly.',
    },
  },
  {
    id: 'long-walk',
    category: 'move',
    durationMin: 20,
    title: { cs: 'Dvacetiminutová svižná chůze', en: '20-minute brisk walk' },
    description: {
      cs: 'Vyraž na dvacetiminutovou trasu bez sluchátek. Sleduj rytmus kroků a nech hlavu vychladnout.',
      en: 'Go for a 20-minute walk without headphones. Pay attention to your pace and let your mind settle.',
    },
  },
  {
    id: 'breath-478',
    category: 'breath',
    durationMin: 2,
    title: { cs: 'Řízené dýchání 4 · 7 · 8', en: 'Guided 4 · 7 · 8 breathing' },
    description: {
      cs: 'Nádech nosem 4 sekundy, klidná pauza 7 sekund, dlouhý výdech ústy 8 sekund. Stačí 4 kola.',
      en: 'Inhale gently for 4 seconds, hold softly for 7 seconds, exhale slowly for 8 seconds. Four cycles are plenty.',
    },
    hasBreathingGuide: true,
  },
  {
    id: 'cold-face',
    category: 'breath',
    durationMin: 2,
    title: { cs: 'Mírné omytí obličeje studenou vodou', en: 'Mild cold water face splash' },
    description: {
      cs: 'Opláchni si obličej a zápěstí studenou vodou po dobu 20–30 sekund a pak třikrát pomalu vydechni.',
      en: 'Splash your face and wrists with cool water for 20–30 seconds, followed by three slow exhales.',
    },
    safetyNote: {
      cs: 'Bezpečnostní poznámka: Použij jen běžnou studenou vodu na obličej; vyhni se extrémnímu chladu při potížích se srdcem nebo tlakem.',
      en: 'Safety note: Use mild cool water on your face only; avoid intense cold exposure if you have heart or blood pressure conditions.',
    },
  },
  {
    id: 'water-stretch',
    category: 'breath',
    durationMin: 2,
    title: { cs: 'Sklenice vody a protažení zad', en: 'Glass of water & overhead stretch' },
    description: {
      cs: 'Vypij pomalu celou sklenici vody, zvedni paže nad hlavu a minutu vnímej svůj dech v břiše.',
      en: 'Drink a full glass of water slowly, reach overhead, and notice your breathing in your belly for a minute.',
    },
  },
  {
    id: 'body-scan',
    category: 'breath',
    durationMin: 10,
    title: { cs: 'Klidné uvolnění ramen a čelisti', en: 'Jaw & shoulder release' },
    description: {
      cs: 'Sedni si rovně, povol čelist, spusť ramena dolů a deset minut nebo pět minut jen sleduj, jak tělo sedí na židli.',
      en: 'Sit upright, unclench your jaw, drop your shoulders, and quietly notice the weight of your body on the chair.',
    },
  },
  {
    id: 'phone-away',
    category: 'focus',
    durationMin: 10,
    title: { cs: 'Telefon na 15 minut do jiné místnosti', en: 'Phone in another room for 15 minutes' },
    description: {
      cs: 'Polož telefon mimo dosah — třeba do předsíně nebo kuchyně. Dej si čtvrthodinu bez displeje.',
      en: 'Place your phone out of reach in the hallway or kitchen. Take fifteen screen-free minutes.',
    },
  },
  {
    id: 'grounding-54321',
    category: 'focus',
    durationMin: 2,
    title: { cs: 'Smyslové ukotvení 5–4–3–2–1', en: '5–4–3–2–1 sensory grounding' },
    description: {
      cs: 'Pojmenuj potichu 5 věcí, které vidíš, 4 kterých se dotýkáš, 3 které slyšíš, 2 vůně a 1 chuť.',
      en: 'Quietly name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, and 1 taste.',
    },
  },
  {
    id: 'three-words',
    category: 'focus',
    durationMin: 2,
    title: { cs: 'Pojmenovat pocit třemi slovy', en: 'Name the feeling in three words' },
    description: {
      cs: 'Napiš si nebo řekni nahlas přesně třemi slovy, co teď cítíš (např. „únava, tlak, ticho“). Pojmenování ztlumí automatiku.',
      en: 'Write or say aloud three words for what is happening right now (e.g. "tired, restless, late"). Naming slows autopilot.',
    },
  },
  {
    id: 'read-or-music',
    category: 'focus',
    durationMin: 20,
    title: { cs: 'Klidná hudba nebo papírová kniha', en: 'Calm music or a paper book' },
    description: {
      cs: 'Pusť si jednu klidnou instrumentální skladbu nebo otevři papírovou knihu na 15–20 minut mimo obrazovky.',
      en: 'Listen to a calm instrumental track or read a physical book for 15–20 minutes away from screens.',
    },
  },
];

export const CRISIS_CONTACTS: {
  name: BilingualText;
  number: string;
  tel: string;
  desc: BilingualText;
}[] = [
  {
    name: { cs: 'Linka první psychické pomoci', en: 'Czech First Psychological Aid Line' },
    number: '116 123',
    tel: '116123',
    desc: { cs: 'Nonstop · zdarma · anonymně (ČR)', en: '24/7 · free · anonymous (CZ)' },
  },
  {
    name: { cs: 'Tísňová linka', en: 'Emergency Line (EU / CZ)' },
    number: '112',
    tel: '112',
    desc: { cs: 'Okamžitá pomoc v akutním ohrožení', en: 'Immediate emergency assistance' },
  },
  {
    name: { cs: 'Linka bezpečí (do 26 let)', en: 'Youth Helpline (up to 26)' },
    number: '116 111',
    tel: '116111',
    desc: { cs: 'Nonstop · zdarma (ČR)', en: '24/7 · free (CZ)' },
  },
];

export const STONES_META: {
  id: StoneId;
  title: BilingualText;
  desc: BilingualText;
}[] = [
  {
    id: 'ch1',
    title: { cs: 'První krok', en: 'First step' },
    desc: { cs: 'První záznam nebo check-in v aplikaci', en: 'First entry or check-in recorded' },
  },
  {
    id: 'ch4',
    title: { cs: 'Všímavost vzorců', en: 'Seeing patterns' },
    desc: { cs: 'Pět check-inů nálady nebo poznámek', en: 'Five mood check-ins or notes' },
  },
  {
    id: 'ch7',
    title: { cs: 'Rozhled v knihovně', en: 'Quiet clarity' },
    desc: { cs: 'Přečteno pět textů v edukaci', en: 'Read five education guides' },
  },
  {
    id: 'urge',
    title: { cs: 'Přeplaval jsem vlnu', en: 'Rode the wave' },
    desc: { cs: 'Zapsané nutkání, které prošlo', en: 'Logged an urge that passed' },
  },
  {
    id: 'why',
    title: { cs: 'Znám své proč', en: 'Knew my why' },
    desc: { cs: 'Napsaný vlastní důvod nebo plán', en: 'Saved a personal reason or plan' },
  },
  {
    id: 'week',
    title: { cs: 'Sedm dnů přítomnosti', en: 'Seven days present' },
    desc: { cs: 'Záznam v sedmi různých dnech', en: 'Entries across seven different days' },
  },
];

export const PRIVACY_SECTIONS: { title: BilingualText; body: BilingualText }[] = [
  {
    title: { cs: '1. Vše zůstává v tvém zařízení', en: '1. Everything stays on your device' },
    body: {
      cs: 'BetterFree neprovozuje žádný server, databázi ani uživatelské účty. Poznámky, nálady, spouštěče, kontakty i nastavení se ukládají výhradně v lokálním úložišti prohlížeče (localStorage).',
      en: 'BetterFree runs no servers, databases, or user accounts. Notes, mood logs, triggers, contacts, and settings are stored solely inside your browser’s localStorage.',
    },
  },
  {
    title: { cs: '2. Žádná analytika ani třetí strany', en: '2. Zero analytics or third parties' },
    body: {
      cs: 'Aplikace neobsahuje reklamní kódy, sledovací pixely ani analytické skripty. Po nainstalování funguje plně offline.',
      en: 'The app includes zero ad networks, tracking pixels, or analytics SDKs. Once installed, it works completely offline.',
    },
  },
  {
    title: { cs: '3. Ochrana PINem a šifrovaná záloha', en: '3. PIN lock & encrypted backup' },
    body: {
      cs: 'Zámek aplikace ukládá pouze jednosměrný otisk PINu (PBKDF2-SHA256). Exportovaná záloha je zašifrována tvým vlastním heslem pomocí AES-256-GCM.',
      en: 'The app lock stores only a one-way PBKDF2-SHA256 hash of your PIN. Exported backups are encrypted with your own passphrase using AES-256-GCM.',
    },
  },
  {
    title: { cs: '4. Ztráta dat a smazání', en: '4. Data erasure & browser storage' },
    body: {
      cs: 'Vymazání dat prohlížeče smaže i záznamy BetterFree. Na iPhonu má aplikace přidaná na plochu vlastní úložiště oddělené od Safari — proto doporučujeme občasný export šifrované zálohy. Data můžeš kdykoli smazat jedním tlačítkem v Nastavení.',
      en: 'Clearing browser site data removes BetterFree records. On iOS, a Home Screen PWA keeps separate storage from Safari, so periodic encrypted exports are recommended. You can erase all local data anytime in Settings.',
    },
  },
  {
    title: { cs: '5. Vymezení mimo zdravotnický prostředek', en: '5. Non-medical scope' },
    body: {
      cs: 'BetterFree je osobní nástroj pro práci s návyky a všímavostí pro dospělé (18+). Neposkytuje lékařskou diagnózu ani léčbu.',
      en: 'BetterFree is a personal habit awareness tool for adults (18+). It does not provide medical diagnosis or treatment.',
    },
  },
];

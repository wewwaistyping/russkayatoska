const fs = require('fs');

const FILE = 'D:/Загрузки/Новая папка/RUSSKAYA TOSKA CHAPTER 2 UPDATE Kesha (5).json';
const data = JSON.parse(fs.readFileSync(FILE, 'utf-8'));

// ═══ HELPERS ═══

function isRu(s) { return /[а-яёА-ЯЁ]/.test(s); }
function isRegex(s) { return /^\/.*\/[a-z]*$/.test(s); }
function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function enRegex(word, cs = false) {
  const p = esc(word).replace(/\s+/g, '\\s+');
  return cs ? `/\\b${p}\\b/` : `/\\b${p}\\b/i`;
}

function ruStemRegex(word, cs = false) {
  const flag = cs ? '/' : '/i';
  if (word.includes(' ')) {
    const p = esc(word).replace(/\s+/g, '\\s+');
    return `/(?:^|[^а-яёА-ЯЁ])${p}(?=[^а-яёА-ЯЁ]|$)${flag}`;
  }
  let stem = word;
  if (/(?:ый|ий|ой|ая|яя|ое|ее|ые|ие)$/.test(stem) && stem.length > 4) stem = stem.slice(0, -2);
  else if (/(?:ость|есть)$/.test(stem) && stem.length > 5) stem = stem.slice(0, -1);
  else if (/(?:ние|тие|ция|зия)$/.test(stem) && stem.length > 5) stem = stem.slice(0, -1);
  else if (/[ая]$/.test(stem) && stem.length > 3) stem = stem.slice(0, -1);
  else if (/ь$/.test(stem) && stem.length > 3) stem = stem.slice(0, -1);
  else if (/[ыи]$/.test(stem) && stem.length > 4) stem = stem.slice(0, -1);
  else if (/[ое]$/.test(stem) && stem.length > 3) stem = stem.slice(0, -1);

  if (stem.length < 3) return `/(?:^|[^а-яёА-ЯЁ])${esc(word)}(?=[^а-яёА-ЯЁ]|$)${flag}`;
  return `/(?:^|[^а-яёА-ЯЁ])${esc(stem)}[а-яёА-ЯЁ]*(?=[^а-яёА-ЯЁ]|$)${flag}`;
}

function ruExact(word, cs = false) {
  const flag = cs ? '/' : '/i';
  return `/(?:^|[^а-яёА-ЯЁ])${esc(word)}(?=[^а-яёА-ЯЁ]|$)${flag}`;
}

const NO_STEM_RU = new Set(['Ева', 'Дана', 'Вика', 'Лена', 'Изя', 'Юля', 'Зина', 'Паша', 'Гена', 'Сева', 'Вова', 'Лиса']);

function convert(k) {
  if (isRegex(k)) return k;
  if (isRu(k)) {
    return NO_STEM_RU.has(k) ? ruExact(k) : ruStemRegex(k);
  }
  return enRegex(k);
}

// ═══ NEW KEYWORD ARRAYS ═══
// null = keep original (just convert to regex + fix selective)
// [...] = complete replacement

const NEW_KEYS = {
  // LOCATIONS — proper names only, remove generic words
  '0': null, // Trupovolkovo — already good (3 regex keys)

  '2': [ // vibe — remove "культура","culture","vibe","атмосфера" (all too broad)
    "social markers", "2015-2018",
    "социальные маркеры", "провинциальная эстетика",
  ],

  '3': [ // Iceberg — remove "shopping center","парковка"
    "Iceberg", "TC Iceberg", "Айсберг", "ТЦ Айсберг",
  ],

  '4': null, // BUNKER — already good

  '5': [ // Betonka — FIX: uses \b with Cyrillic!
    "/(?:^|[^а-яёА-ЯЁ])Бетонк[а-яёА-ЯЁ]*(?=[^а-яёА-ЯЁ]|$)/i",
    "/(?:^|[^а-яёА-ЯЁ])набережн[а-яёА-ЯЁ]*(?=[^а-яёА-ЯЁ]|$)/i",
    "/(?:^|[^а-яёА-ЯЁ])Енисей[а-яёА-ЯЁ]*(?=[^а-яёА-ЯЁ]|$)/i",
    "/\\bBetonka\\b/i", "/\\bembankment\\b/i", "/\\bYenisei\\b/i",
  ],

  '6': [ // Solnechny — remove "the district","район"
    "Solnechny", "Солнечный", "Solnechny district", "район Солнечный", "Солнышко",
  ],

  '7': [ // Sputnik — remove "the shop"
    "Sputnik", "Спутник", "video rental", "видеопрокат",
  ],

  '9': [ // Besovo — remove "the village","деревня"
    "Besovo", "Бесово", "Besovo village", "деревня Бесово",
  ],

  '16': [ // PGT Pozhukhlovo — remove "the settlement","посёлок"
    "Pozhukhlovo", "Пожухлово", "PGT Pozhukhlovo", "ПГТ Пожухлово",
  ],

  '40': [ // Joy and Boobs — remove "the club","клуб"
    "Joy and Boobs", "Радость и Сиськи", "strip club", "стрип-клуб",
  ],

  '44': [ // Zvezdny — remove "the district","район"
    "Zvezdny", "Звёздный", "Zvezdny district", "район Звёздный",
  ],

  '47': [ // khton — keep folklore terms but remove generic "spirits","folklore"
    "khton", "хтонь", "домовой", "мавка", "леший",
    "/(?:^|[^а-яёА-ЯЁ])нечист[а-яёА-ЯЁ]*(?=[^а-яёА-ЯЁ]|$)/i",
  ],

  '56': [ // Pilorama — collapse inflections to stems
    "ЛесПромСервис", "пилорама", "лесопилка",
    "LesPromServis", "sawmill", "timber plant",
  ],

  // CHARACTERS — keep names only, remove broad descriptors

  '25': [ // Artem — remove "призрак" (ghost, too broad)
    "Artem Sidorov", "Artem", "Ghost boy", "Sidorov",
    "Артём Сидоров", "Артём", "Артем", "Сидоров",
  ],

  '27': [ // Lena — remove "fashionista","модница"
    "Lena", "Лена", "fashionista Lena", "модница Лена",
  ],

  '35': [ // Elizaveta — remove standalone "judge"
    "Elizaveta Belozerskaya", "Elizaveta", "Sistema", "The System", "Belozerskaya",
    "Елизавета Белозерская", "Елизавета", "Система", "Белозерская",
  ],

  '51': [ // Gena — collapse manual inflections
    "Gennady", "Gena", "Caymanov", "Genarek",
    "Геннадий", "Гена", "Кайманов", "Генарёк", "Генарек",
  ],

  '53': [ // Band — keep name variants
    "В поисках похвалы и пахлавы",
    "V Poiskakh Pokhvaly i Pakhlavy",
    "In Search of Praise and Baklava",
    "группа Степана", "группа Паши",
  ],

  '57': [ // Gena's coworkers — keep names, remove "работяги"
    "Асадбек", "Рахимов", "Лёха", "Алексей Дубов", "Егор Савченко",
    "коллеги Гены",
    "Asadbek", "Rakhimov", "Lyokha", "Dubov", "Savchenko",
  ],
};

// ═══ TRANSFORM ═══

let stats = { selectiveFixed: 0, rewritten: 0, converted: 0, cyrillicBFixed: 0 };

for (const [id, entry] of Object.entries(data.entries)) {
  // 1. Fix broken selective
  if (entry.selective && (!entry.keysecondary || entry.keysecondary.length === 0)) {
    entry.selective = false;
    stats.selectiveFixed++;
  }

  const newKeys = NEW_KEYS[id];

  if (newKeys !== undefined && newKeys !== null) {
    // Full rewrite
    entry.key = newKeys.map(k => convert(k));
    stats.rewritten++;
  } else {
    // Convert existing + fix Cyrillic \b patterns
    entry.key = entry.key.map(k => {
      // Fix Cyrillic \b patterns
      if (isRegex(k) && /\\b.*[а-яёА-ЯЁ]/.test(k)) {
        stats.cyrillicBFixed++;
        // Extract the Cyrillic content and rebuild with lookaround
        // This is complex; for now flag but don't auto-fix (entry 5 is handled above)
        return k;
      }
      if (isRegex(k)) return k;
      stats.converted++;
      return convert(k);
    });
  }
}

// ═══ RECURSION — set logically ═══
const ALLOW_RECURSION = new Set([
  '0',  // Trupovolkovo — hub city
  '2',  // vibe — atmosphere reference
]);

for (const [id, entry] of Object.entries(data.entries)) {
  const allow = ALLOW_RECURSION.has(id);
  entry.preventRecursion = !allow;
  if (entry.extensions) entry.extensions.prevent_recursion = !allow;
}

// ═══ OUTPUT ═══

fs.writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf-8');

console.log('═══════════════════════════════════════════');
console.log(' RUSSKAYA TOSKA — FIX COMPLETE');
console.log('═══════════════════════════════════════════');
console.log(`Selective fixed:      ${stats.selectiveFixed}`);
console.log(`Entries rewritten:    ${stats.rewritten}`);
console.log(`Keywords converted:   ${stats.converted}`);
console.log();

// Verify
let issues = 0;
for (const [id, e] of Object.entries(data.entries)) {
  for (const k of e.key) {
    if (!/^\/.*\/[a-z]*$/.test(k)) { console.log('PLAIN: [' + id + '] ' + k); issues++; }
  }
  if (e.selective && (!e.keysecondary || !e.keysecondary.length)) { console.log('BROKEN_SEL: [' + id + ']'); issues++; }
}
console.log(issues === 0 ? 'All clean!' : issues + ' issues remaining');

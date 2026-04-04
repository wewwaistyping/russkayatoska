const fs = require('fs');

const INPUT = 'D:/Загрузки/Новая папка/🍁SACRAMENT🍁GEN I (3).json';
const OUTPUT = 'D:/Загрузки/Новая папка/🍁SACRAMENT🍁GEN I (REGEX).json';

const data = JSON.parse(fs.readFileSync(INPUT, 'utf-8'));

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function isRu(s) { return /[а-яёА-ЯЁ]/.test(s); }
function isAlreadyRegex(s) { return /^\/.*\/[a-z]*$/.test(s); }
function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

/**
 * English word-boundary regex: /\bword\b/i
 * Multi-word: /\bword\s+word\b/i
 */
function enRegex(word, cs = false) {
  const p = esc(word).replace(/\s+/g, '\\s+');
  return cs ? `/\\b${p}\\b/` : `/\\b${p}\\b/i`;
}

/**
 * Russian stem extraction.
 * Strips common noun/adjective endings to get the stem.
 * Returns { stem, exact } where exact=true means multi-word phrase (use exact match).
 */
function ruGetStem(word) {
  if (word.includes(' ')) return { stem: word, exact: true };

  let s = word;

  // 1) Adjective/ordinal endings: -ый, -ий, -ой, -ая, -яя, -ое, -ее, -ые, -ие
  if (/(?:ый|ий|ой|ая|яя|ое|ее|ые|ие)$/.test(s) && s.length > 4) {
    return { stem: s.slice(0, -2), exact: false };
  }
  // 2) Abstract nouns: -ость, -есть
  if (/(?:ость|есть)$/.test(s) && s.length > 5) {
    return { stem: s.slice(0, -1), exact: false };
  }
  // 3) -ние, -тие, -ция, -зия
  if (/(?:ние|тие|ция|зия)$/.test(s) && s.length > 5) {
    return { stem: s.slice(0, -1), exact: false };
  }
  // 4) Feminine nouns: -а, -я
  if (/[ая]$/.test(s) && s.length > 3) {
    return { stem: s.slice(0, -1), exact: false };
  }
  // 5) Soft sign: -ь
  if (/ь$/.test(s) && s.length > 3) {
    return { stem: s.slice(0, -1), exact: false };
  }
  // 6) Plural: -ы, -и
  if (/[ыи]$/.test(s) && s.length > 4) {
    return { stem: s.slice(0, -1), exact: false };
  }
  // 7) Neuter: -о, -е
  if (/[ое]$/.test(s) && s.length > 3) {
    return { stem: s.slice(0, -1), exact: false };
  }
  // 8) Default: masculine nouns ending in consonant — stem is the word itself
  return { stem: s, exact: false };
}

/**
 * Russian STEM regex: stem + any Cyrillic suffix
 * /(?:^|[^а-яёА-ЯЁ])stem[а-яёА-ЯЁ]*(?=[^а-яёА-ЯЁ]|$)/i
 */
function ruStemRegex(word, cs = false) {
  const flag = cs ? '/' : '/i';

  if (word.includes(' ')) {
    const p = esc(word).replace(/\s+/g, '\\s+');
    return `/(?:^|[^а-яёА-ЯЁ])${p}(?=[^а-яёА-ЯЁ]|$)${flag}`;
  }

  const { stem } = ruGetStem(word);

  // Safety: stem under 3 chars → too short for stem match, use exact
  if (stem.length < 3) {
    return `/(?:^|[^а-яёА-ЯЁ])${esc(word)}(?=[^а-яёА-ЯЁ]|$)${flag}`;
  }

  return `/(?:^|[^а-яёА-ЯЁ])${esc(stem)}[а-яёА-ЯЁ]*(?=[^а-яёА-ЯЁ]|$)${flag}`;
}

/**
 * Russian EXACT regex: matches only the given word form, no suffix wildcard
 * /(?:^|[^а-яёА-ЯЁ])word(?=[^а-яёА-ЯЁ]|$)/i
 */
function ruExactRegex(word, cs = false) {
  const flag = cs ? '/' : '/i';
  if (word.includes(' ')) {
    const p = esc(word).replace(/\s+/g, '\\s+');
    return `/(?:^|[^а-яёА-ЯЁ])${p}(?=[^а-яёА-ЯЁ]|$)${flag}`;
  }
  return `/(?:^|[^а-яёА-ЯЁ])${esc(word)}(?=[^а-яёА-ЯЁ]|$)${flag}`;
}


// ═══════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════

/**
 * Russian keywords that should NOT be stemmed.
 * Foreign indeclinable names or names where stem < 4 chars
 * produces dangerous false positives.
 */
const NO_STEM_RU = new Set([
  'Нико',    // stem "Ник" → matches "Никогда", "Никто"
  'Ро',      // 2 chars
  'Ив',      // 2 chars
  'Вал',     // 3 chars, matches "Валенки", "Валить"
  'Хлоя',    // stem "Хло" → matches "Хлопок", "Хлор"
  'Мосс',    // exact foreign name
]);

/**
 * Keywords that need CASE-SENSITIVE regex.
 * Common English/Russian words used as character names.
 */
const CASE_SENSITIVE = new Set([
  // English
  'Roman',   // vs "roman" (romance style)
  'Ro',      // short nickname
  'Rose',    // vs "rose" (flower, past tense of rise) — CRITICAL in flower-themed lorebook
  'Val',     // vs "val" (value)
  'Eve',     // vs "eve" (Christmas Eve, New Year's Eve)
  'Moss',    // vs "moss" (plant) — in nature-themed setting
  'Mars',    // vs "mars" (planet, verb)
  // Russian
  'Роман',   // vs "роман" (novel)
  'Ро',      // short nickname
  'Роуз',    // unique enough but consistent with English
  'Вал',     // vs "вал" (shaft, wave, rampart)
  'Ив',      // vs "ив" (willows genitive)
  'Мосс',    // foreign name
  'Марс',    // vs "марс" (mars platform on ship)
]);

/**
 * Per-entry overrides.
 *
 * - remove: keywords to delete
 * - selective: override selective flag (fix broken entries)
 * - replaceAllKeys: completely replace the key array (for entries with redundant inflected forms)
 */
const OVERRIDES = {
  // ══════════════ FIX BROKEN SELECTIVE ══════════════
  // These entries have selective:true but EMPTY keysecondary.
  // With selectiveLogic:0 (AND ANY), they NEVER fire. Critical bug.
  '3':  { selective: false },
  '27': { selective: false, remove: ['books', 'книги'] },
  '56': { selective: false },
  '60': { selective: false, remove: ['Italian', 'итальянец'] },
  '65': { selective: false },
  '70': { selective: false },
  '71': { selective: false },

  // ══════════════ FIX BROAD KEYWORDS ══════════════
  '4':  { remove: ['school', 'institution', 'школа', 'институт'] },
  '5':  { remove: ['town', 'город', 'городок'] },
  '25': { remove: ['classes', 'классы'] },
  '29': { remove: ['the point'] },
  '35': { remove: ['cafe', 'кафе'] },
  '38': { remove: ['archives', 'архивы'] },
  '40': { remove: ['coffee', 'кофе'] },
  '41': { remove: ['games', 'игры'] },
  '42': { remove: ['research', 'исследования'] },
  '48': { remove: ['have you seen', 'вы видели'] },
  '49': { remove: ['her name', 'её имя'] },
  '50': { remove: ['they were together', 'они были вместе'] },
  '51': { remove: ['what happened', 'что случилось'] },
  '69': { remove: ['memory', 'память'] },

  // ══════════════ FIX COLLISIONS ══════════════
  // "Italian"/"итальянец" on BOTH Nico(60) and Theo(67) — remove from both
  '67': { remove: ['Italian', 'итальянец'] },
  // "cafe"/"кафе" collision: removed from Diner(35), kept on Spruce Goose(40) above
  // "archives"/"архивы" collision: removed from Museum(38), kept on Library(27)
  // "classes"/"классы" collision: removed from Academic Halls(25), kept on Curriculum(15)
  // "research"/"исследования" collision: removed from Public Library(42), kept on Research Ethics(9)

  // ══════════════ COLLAPSE INFLECTED FORMS ══════════════
  // Entry 70: Red Cardinals — 29 keys with redundant Russian inflections
  '70+keys': [
    "Red Cardinals", "Cardinals", "basketball team",
    "Красные кардиналы", "Кардинал", "баскетбольная команда",
    "Mars", "Mark Johnson", "JJ", "Jamal Jackson", "Derek Williams", "Tyler Chen", "Ryan O'Brien",
    "Марс", "Марк Джонсон", "ДжейДжей",
    "/(?:^|[^а-яёА-ЯЁ])Джей-?Джей(?=[^а-яёА-ЯЁ]|$)/i",
    "Джамал", "Дерек", "Тайлер", "Райан", "Вильямс", "Джексон", "О'Брайен"
  ],
  // Entry 71: Félix Curie — 12 keys with 5 redundant Russian inflections
  '71+keys': [
    "Félix Curie", "Félix", "Felix", "Iceman",
    "Феликс Кюри", "Феликс", "Айсмен", "Айсмэн"
  ],
};


// ═══════════════════════════════════════════════════════════
// TRANSFORM
// ═══════════════════════════════════════════════════════════

function convertKeyword(k) {
  if (isAlreadyRegex(k)) return k;
  const cs = CASE_SENSITIVE.has(k);
  if (isRu(k)) {
    return NO_STEM_RU.has(k) ? ruExactRegex(k, cs) : ruStemRegex(k, cs);
  }
  return enRegex(k, cs);
}

const stats = {
  totalEntries: 0,
  keywordsConverted: 0,
  keywordsRemoved: 0,
  selectiveFixed: 0,
  collapsedInflections: 0,
};

for (const [id, entry] of Object.entries(data.entries)) {
  stats.totalEntries++;
  const ovr = OVERRIDES[id] || {};
  const removeSet = new Set(ovr.remove || []);
  const replacementKeys = OVERRIDES[id + '+keys'];

  // Fix selective flag
  if (ovr.selective !== undefined && entry.selective !== ovr.selective) {
    entry.selective = ovr.selective;
    stats.selectiveFixed++;
  }

  // Transform keys
  if (replacementKeys) {
    // Full key replacement (collapsed inflections)
    const origLen = entry.key.length;
    entry.key = replacementKeys.map(k => convertKeyword(k));
    stats.collapsedInflections += origLen - entry.key.length;
    stats.keywordsConverted += entry.key.length;
  } else {
    // Normal transform: filter removals, convert to regex
    const origLen = entry.key.length;
    entry.key = entry.key
      .filter(k => {
        if (removeSet.has(k)) {
          stats.keywordsRemoved++;
          return false;
        }
        return true;
      })
      .map(k => {
        stats.keywordsConverted++;
        return convertKeyword(k);
      });
  }

  // Transform secondary keys (if any)
  if (entry.keysecondary && entry.keysecondary.length > 0) {
    entry.keysecondary = entry.keysecondary.map(k => convertKeyword(k));
  }
}

// ═══════════════════════════════════════════════════════════
// OUTPUT
// ═══════════════════════════════════════════════════════════

fs.writeFileSync(OUTPUT, JSON.stringify(data, null, 2), 'utf-8');

console.log('═══════════════════════════════════════');
console.log('LOREBOOK REGEX TRANSFORMATION COMPLETE');
console.log('═══════════════════════════════════════');
console.log(`Entries processed:        ${stats.totalEntries}`);
console.log(`Keywords converted:       ${stats.keywordsConverted}`);
console.log(`Broad keywords removed:   ${stats.keywordsRemoved}`);
console.log(`Broken selective fixed:   ${stats.selectiveFixed}`);
console.log(`Inflections collapsed:    ${stats.collapsedInflections}`);
console.log(`Output: ${OUTPUT}`);
console.log();

// ═══════════════════════════════════════════════════════════
// VERIFICATION: Show sample conversions
// ═══════════════════════════════════════════════════════════

const samplesToShow = ['0', '4', '5', '49', '59', '62', '66', '68', '69', '70', '71'];
for (const id of samplesToShow) {
  const e = data.entries[id];
  if (e) {
    console.log(`[${id}] ${e.comment} (${e.key.length} keys, selective=${e.selective})`);
    for (const k of e.key) {
      console.log(`  ${k}`);
    }
    console.log();
  }
}

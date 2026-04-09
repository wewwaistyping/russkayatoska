const fs = require('fs');
const FILE = 'D:/SACRAMENT/🍁SACRAMENT🍁RUSREAL_slang_places_etc_test_REGEX_KEYWORDS_TEST_1.json';
const data = JSON.parse(fs.readFileSync(FILE, 'utf-8'));

function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function exact(word) { return `/(?:^|[^а-яёА-ЯЁ])${esc(word)}(?=[^а-яёА-ЯЁ]|$)/i`; }
function stem(word) { return `/(?:^|[^а-яёА-ЯЁ])${esc(word)}[а-яёА-ЯЁ]*(?=[^а-яёА-ЯЁ]|$)/i`; }

// ═══ FIXES: standalone short stems → exact match or longer stem ═══
// Format: { entryId: { oldPattern: newPattern } }
// oldPattern is a substring to match in the key
// newPattern is the full replacement regex

const FIXES = {
  // Из[а-яёА-ЯЁ]* → matches "Известно", "Избранный"... → exact Изя
  '104': [
    { match: 'Из[а-яёА-ЯЁ]*(?=[^а-яёА-ЯЁ]|$)', replace: exact('Изя') },
  ],

  // дар[а-яёА-ЯЁ]* → matches "дарить", "Дарья" → exact дар
  '11': [
    { match: 'дар[а-яёА-ЯЁ]*(?=[^а-яёА-ЯЁ]|$)', replace: exact('дар') },
  ],

  // Шут[а-яёА-ЯЁ]* → matches "шутка", "шутить" → exact Шут (case-sensitive no /i)
  '72': [
    { match: 'Шут[а-яёА-ЯЁ]*(?=[^а-яёА-ЯЁ]|$)', replace: `/(?:^|[^а-яёА-ЯЁ])Шут(?=[^а-яёА-ЯЁ]|$)/` },
  ],

  // Лев[а-яёА-ЯЁ]* → matches "левый", "левитация" → exact Лев (case-sensitive)
  '73': [
    { match: 'Лев[а-яёА-ЯЁ]*(?=[^а-яёА-ЯЁ]|$)/i', replace: `/(?:^|[^а-яёА-ЯЁ])Лев(?=[^а-яёА-ЯЁ]|$)/` },
  ],

  // гот[а-яёА-ЯЁ]* → matches "готов", "готовить" → stem готик (готика, готический)
  '83': [
    { match: 'гот[а-яёА-ЯЁ]*(?=[^а-яёА-ЯЁ]|$)', replace: stem('готик') },
  ],

  // бон[а-яёА-ЯЁ]* → matches "бонус" → stem бонхед
  '85': [
    { match: 'бон[а-яёА-ЯЁ]*(?=[^а-яёА-ЯЁ]|$)', replace: stem('бонхед') },
  ],

  // альт[а-яёА-ЯЁ]* → matches "альтернатива" → remove (entry has enough other keys)
  // мош[а-яёА-ЯЁ]* → matches "мошенник" → stem мошпит
  '82': [
    { match: 'альт[а-яёА-ЯЁ]*(?=[^а-яёА-ЯЁ]|$)', replace: null }, // remove
    { match: 'мош[а-яёА-ЯЁ]*(?=[^а-яёА-ЯЁ]|$)', replace: stem('мошпит') },
  ],

  // клуб[а-яёА-ЯЁ]* → matches "клубника" → exact клуб
  '19': [
    { match: 'клуб[а-яёА-ЯЁ]*(?=[^а-яёА-ЯЁ]|$)', replace: exact('клуб') },
  ],

  // курс[а-яёА-ЯЁ]* → matches "курсант" → exact курс
  '15': [
    { match: 'курс[а-яёА-ЯЁ]*(?=[^а-яёА-ЯЁ]|$)', replace: exact('курс') },
  ],

  // Ясен[а-яёА-ЯЁ]* → matches "ясно", "ясень" → exact Ясень
  '78': [
    { match: 'Ясен[а-яёА-ЯЁ]*(?=[^а-яёА-ЯЁ]|$)', replace: exact('Ясень') },
  ],

  // инди[а-яёА-ЯЁ]* → matches "индивидуальный" → exact инди
  '96': [
    { match: 'инди[а-яёА-ЯЁ]*(?=[^а-яёА-ЯЁ]|$)', replace: exact('инди') },
  ],

  // манг[а-яёА-ЯЁ]* → matches "мангал", "манго" → exact манга
  '91': [
    { match: 'манг[а-яёА-ЯЁ]*(?=[^а-яёА-ЯЁ]|$)', replace: exact('манга') },
  ],

  // этик[а-яёА-ЯЁ]* → matches "этикетка" → exact этика
  '9': [
    { match: 'этик[а-яёА-ЯЁ]*(?=[^а-яёА-ЯЁ]|$)', replace: exact('этика') },
  ],
};

// ═══ APPLY FIXES ═══
let fixed = 0;
let removed = 0;

for (const [entryId, fixes] of Object.entries(FIXES)) {
  const entry = data.entries[entryId];
  if (!entry) continue;

  for (const fix of fixes) {
    const idx = entry.key.findIndex(k => k.includes(fix.match));
    if (idx >= 0) {
      if (fix.replace === null) {
        // Remove the key
        const old = entry.key[idx];
        entry.key.splice(idx, 1);
        console.log(`[${entryId}] REMOVED: ${old.substring(0, 60)}`);
        removed++;
      } else {
        // Replace
        const old = entry.key[idx];
        entry.key[idx] = fix.replace;
        console.log(`[${entryId}] ${old.substring(0, 50)}`);
        console.log(`     → ${fix.replace.substring(0, 50)}`);
        fixed++;
      }
    } else {
      console.log(`[${entryId}] NOT FOUND: ${fix.match.substring(0, 50)}`);
    }
  }
}

fs.writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf-8');

console.log();
console.log(`Fixed ${fixed} stems, removed ${removed} keys`);

// Verify: count remaining dangerous standalone stems
console.log();
console.log('═══ REMAINING SHORT STANDALONE STEMS ═══');
let remaining = 0;
for (const [id, e] of Object.entries(data.entries)) {
  for (const k of (e.key || [])) {
    // Match standalone (not multi-word) short stems with wildcard
    // Pattern: ЯЁ])STEM[а-яёА-ЯЁ]* where STEM is 2-4 chars and NO \s+ follows
    const m = k.match(/ЯЁ\]\)([а-яёА-ЯЁ]{1,4})\[а-яёА-ЯЁ\]\*\(\?=/);
    if (m) {
      console.log(`  [${id}] ${(e.comment||'').substring(0,30).padEnd(32)} «${m[1]}» ← ${k.substring(0,60)}`);
      remaining++;
    }
  }
}
console.log(`Total: ${remaining} (were 54)`);

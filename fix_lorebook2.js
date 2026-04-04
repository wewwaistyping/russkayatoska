const fs = require('fs');

const INPUT = 'D:/SACRAMENT/🍁SACRAMENT🍁RUSREAL_slang_places_etc_test_REGEX_KEYWORDS_TEST_1.json';
const OUTPUT = 'D:/SACRAMENT/🍁SACRAMENT🍁RUSREAL_slang_places_etc_test_REGEX_KEYWORDS_TEST_1.json';

const data = JSON.parse(fs.readFileSync(INPUT, 'utf-8'));

// ═══ HELPERS ═══

function isRu(s) { return /[а-яёА-ЯЁ]/.test(s); }
function isRegex(s) { return /^\/.*\/[a-z]*$/.test(s); }
function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function enRegex(word) {
  const p = esc(word).replace(/\s+/g, '\\s+');
  return `/\\b${p}\\b/i`;
}

function ruGetStem(word) {
  if (word.includes(' ')) return { stem: word, multi: true };
  let s = word;
  if (/(?:ый|ий|ой|ая|яя|ое|ее|ые|ие)$/.test(s) && s.length > 4) return { stem: s.slice(0, -2), multi: false };
  if (/(?:ость|есть)$/.test(s) && s.length > 5) return { stem: s.slice(0, -1), multi: false };
  if (/(?:ние|тие|ция|зия)$/.test(s) && s.length > 5) return { stem: s.slice(0, -1), multi: false };
  if (/[ая]$/.test(s) && s.length > 3) return { stem: s.slice(0, -1), multi: false };
  if (/ь$/.test(s) && s.length > 3) return { stem: s.slice(0, -1), multi: false };
  if (/[ыи]$/.test(s) && s.length > 4) return { stem: s.slice(0, -1), multi: false };
  if (/[ое]$/.test(s) && s.length > 3) return { stem: s.slice(0, -1), multi: false };
  return { stem: s, multi: false };
}

function ruStemRegex(word) {
  const { stem, multi } = ruGetStem(word);
  if (multi) {
    const p = esc(stem).replace(/\s+/g, '\\s+');
    return `/(?:^|[^а-яёА-ЯЁ])${p}(?=[^а-яёА-ЯЁ]|$)/i`;
  }
  if (stem.length < 3) {
    return `/(?:^|[^а-яёА-ЯЁ])${esc(word)}(?=[^а-яёА-ЯЁ]|$)/i`;
  }
  return `/(?:^|[^а-яёА-ЯЁ])${esc(stem)}[а-яёА-ЯЁ]*(?=[^а-яёА-ЯЁ]|$)/i`;
}

function convertKeyword(k) {
  if (isRegex(k)) return k;
  if (isRu(k)) return ruStemRegex(k);
  return enRegex(k);
}

// ═══ FIX ═══

let stats = {
  selectiveFixed: 0,
  newlineSplit: 0,
  plainConverted: 0,
};

for (const [id, entry] of Object.entries(data.entries)) {
  // 1. Fix broken selective (ALL entries have this!)
  if (entry.selective && (!entry.keysecondary || entry.keysecondary.length === 0)) {
    entry.selective = false;
    stats.selectiveFixed++;
  }

  // 2. Split newline-jammed keys into separate array elements
  const newKeys = [];
  for (const k of entry.key) {
    if (k.includes('\n')) {
      // Split on newlines, clean up dots/whitespace
      const parts = k.split('\n')
        .map(p => p.replace(/^\s*\.?\s*/, '').replace(/\s*\.?\s*$/, ''))
        .filter(p => p.length > 0);
      newKeys.push(...parts);
      stats.newlineSplit += parts.length - 1;
    } else {
      newKeys.push(k);
    }
  }
  entry.key = newKeys;

  // 3. Convert remaining plain text keywords to regex
  entry.key = entry.key.map(k => {
    if (isRegex(k)) return k;
    stats.plainConverted++;
    return convertKeyword(k);
  });

  // Also fix secondary keys
  if (entry.keysecondary && entry.keysecondary.length > 0) {
    const newSec = [];
    for (const k of entry.keysecondary) {
      if (k.includes('\n')) {
        const parts = k.split('\n')
          .map(p => p.replace(/^\s*\.?\s*/, '').replace(/\s*\.?\s*$/, ''))
          .filter(p => p.length > 0);
        newSec.push(...parts);
      } else {
        newSec.push(k);
      }
    }
    entry.keysecondary = newSec.map(k => isRegex(k) ? k : convertKeyword(k));
  }
}

// ═══ OUTPUT ═══

fs.writeFileSync(OUTPUT, JSON.stringify(data, null, 2), 'utf-8');

console.log('═══════════════════════════════════════════');
console.log(' LOREBOOK 2 — REGEX FIX COMPLETE');
console.log('═══════════════════════════════════════════');
console.log(`Selective fixed:       ${stats.selectiveFixed}`);
console.log(`Newline keys split:    ${stats.newlineSplit}`);
console.log(`Plain text converted:  ${stats.plainConverted}`);

// Verify
let plainRemaining = 0;
let brokenSelective = 0;
let newlineRemaining = 0;
for (const [id, e] of Object.entries(data.entries)) {
  for (const k of e.key) {
    if (!isRegex(k)) plainRemaining++;
    if (k.includes('\n')) newlineRemaining++;
  }
  if (e.selective && (!e.keysecondary || e.keysecondary.length === 0)) brokenSelective++;
}
console.log();
console.log('Verification:');
console.log(`  Plain text remaining: ${plainRemaining}`);
console.log(`  Newline keys remaining: ${newlineRemaining}`);
console.log(`  Broken selective remaining: ${brokenSelective}`);

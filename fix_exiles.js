const fs = require('fs');

const INPUT = 'D:/Загрузки/Новая папка/_݁₊ ⊹ . ݁THE EXILES. ݁₊ ⊹ . ݁ (2).json';
const OUT_ST = 'D:/Загрузки/Новая папка/THE EXILES — SillyTavern.json';
const OUT_JAN = 'D:/Загрузки/Новая папка/THE EXILES — JanitorAI.json';

const data = JSON.parse(fs.readFileSync(INPUT, 'utf-8'));

// ═══ HELPERS ═══
function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function isRu(s) { return /[а-яёА-ЯЁ]/.test(s); }

function enRegex(w) {
  return `/\\b${esc(w).replace(/\s+/g, '\\s+')}\\b/i`;
}
function ruStemRegex(w) {
  if (w.includes(' ')) return `/(?:^|[^а-яёА-ЯЁ])${esc(w).replace(/\s+/g, '\\s+')}(?=[^а-яёА-ЯЁ]|$)/i`;
  let s = w;
  if (/(?:ый|ий|ой|ая|яя|ое|ее|ые|ие)$/.test(s) && s.length > 4) s = s.slice(0, -2);
  else if (/[ая]$/.test(s) && s.length > 3) s = s.slice(0, -1);
  else if (/ь$/.test(s) && s.length > 3) s = s.slice(0, -1);
  else if (/[ыи]$/.test(s) && s.length > 4) s = s.slice(0, -1);
  else if (/[ое]$/.test(s) && s.length > 3) s = s.slice(0, -1);
  if (s.length < 3) return `/(?:^|[^а-яёА-ЯЁ])${esc(w)}(?=[^а-яёА-ЯЁ]|$)/i`;
  return `/(?:^|[^а-яёА-ЯЁ])${esc(s)}[а-яёА-ЯЁ]*(?=[^а-яёА-ЯЁ]|$)/i`;
}
function ruExact(w) { return `/(?:^|[^а-яёА-ЯЁ])${esc(w)}(?=[^а-яёА-ЯЁ]|$)/i`; }

const NO_STEM = new Set(['Gio','Тёма','Тёмы','Тёме','Тёмой','Нино','Зураб','Гио','Саша','Маша','Лена','Алиса','Вова','Валера']);

function convert(k) {
  if (/^\/.*\/[a-z]*$/.test(k)) return k;
  if (isRu(k)) return NO_STEM.has(k) ? ruExact(k) : ruStemRegex(k);
  return enRegex(k);
}

// ═══ VERSION 1: SillyTavern (regex keys, fix selective) ═══
const stData = JSON.parse(JSON.stringify(data)); // deep clone

for (const [id, e] of Object.entries(stData.entries)) {
  // Fix selective
  if (e.selective && (!e.keysecondary || e.keysecondary.length === 0)) {
    e.selective = false;
  }
  // Convert keys to regex
  e.key = e.key.map(k => convert(k));
  // Dedupe
  e.key = [...new Set(e.key)];
}

fs.writeFileSync(OUT_ST, JSON.stringify(stData, null, 2), 'utf-8');

// ═══ VERSION 2: JanitorAI (plain text keys, no regex, fix selective) ═══
const janData = JSON.parse(JSON.stringify(data)); // deep clone from original

for (const [id, e] of Object.entries(janData.entries)) {
  // Fix selective
  if (e.selective && (!e.keysecondary || e.keysecondary.length === 0)) {
    e.selective = false;
  }
  // Keep keys as plain text (JanitorAI doesn't support regex)
  // But dedupe
  e.key = [...new Set(e.key)];
}

fs.writeFileSync(OUT_JAN, JSON.stringify(janData, null, 2), 'utf-8');

// ═══ STATS ═══
console.log('═══════════════════════════════════════');
console.log('THE EXILES — TWO VERSIONS CREATED');
console.log('═══════════════════════════════════════');

function verify(path, label) {
  const d = JSON.parse(fs.readFileSync(path, 'utf-8'));
  let regexK=0, plainK=0, brokenSel=0, dupes=0, totalK=0;
  for (const [id, e] of Object.entries(d.entries)) {
    for (const k of e.key) {
      totalK++;
      if (/^\/.*\/[a-z]*$/.test(k)) regexK++; else plainK++;
    }
    if (e.selective && (!e.keysecondary || !e.keysecondary.length)) brokenSel++;
    const s = new Set(e.key);
    if (s.size < e.key.length) dupes++;
  }
  console.log(`\n${label}:`);
  console.log(`  Keys: ${totalK} (regex: ${regexK}, plain: ${plainK})`);
  console.log(`  Broken selective: ${brokenSel}`);
  console.log(`  Duplicate entries: ${dupes}`);
  console.log(`  File: ${path}`);
}

verify(OUT_ST, 'SillyTavern version');
verify(OUT_JAN, 'JanitorAI version');

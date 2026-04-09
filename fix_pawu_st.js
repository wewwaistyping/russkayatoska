const fs = require('fs');

const INPUT = 'D:/Загрузки/Новая папка/PAW U — JanitorAI.json';
const OUTPUT = 'D:/Загрузки/Новая папка/PAW U — SillyTavern.json';

const data = JSON.parse(fs.readFileSync(INPUT, 'utf-8'));

// ═══ HELPERS ═══
function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function en(w) { return `/\\b${esc(w).replace(/\s+/g,'\\s+')}\\b/i`; }
function ruS(w) {
  if (w.includes(' ')) return `/(?:^|[^а-яёА-ЯЁ])${esc(w).replace(/\s+/g,'\\s+')}(?=[^а-яёА-ЯЁ]|$)/i`;
  let s = w;
  if (/(?:ый|ий|ой|ая|яя|ое|ее|ые|ие)$/.test(s) && s.length > 4) s = s.slice(0, -2);
  else if (/(?:ция|зия)$/.test(s) && s.length > 5) s = s.slice(0, -1);
  else if (/[ая]$/.test(s) && s.length > 3) s = s.slice(0, -1);
  else if (/ь$/.test(s) && s.length > 3) s = s.slice(0, -1);
  else if (/[ыи]$/.test(s) && s.length > 4) s = s.slice(0, -1);
  else if (/[ое]$/.test(s) && s.length > 3) s = s.slice(0, -1);
  if (s.length < 3) return `/(?:^|[^а-яёА-ЯЁ])${esc(w)}(?=[^а-яёА-ЯЁ]|$)/i`;
  return `/(?:^|[^а-яёА-ЯЁ])${esc(s)}[а-яёА-ЯЁ]*(?=[^а-яёА-ЯЁ]|$)/i`;
}
function ruE(w) { return `/(?:^|[^а-яёА-ЯЁ])${esc(w)}(?=[^а-яёА-ЯЁ]|$)/i`; }

// Short RU names — exact match, no stemming
const NO_STEM = new Set(['Трой', 'Джо', 'Чейз', 'Джин', 'Лю', 'мех', 'поп']);

function convert(k) {
  if (/^\/.*\/[a-z]*$/.test(k)) return k; // already regex
  if (/[а-яёА-ЯЁ]/.test(k)) return NO_STEM.has(k) ? ruE(k) : ruS(k);
  return en(k);
}

// ═══ CONVERT ALL KEYS ═══
let converted = 0;
for (const [id, e] of Object.entries(data.entries)) {
  e.key = e.key.map(k => { converted++; return convert(k); });
  // Dedupe
  e.key = [...new Set(e.key)];
}

fs.writeFileSync(OUTPUT, JSON.stringify(data, null, 2), 'utf-8');

// ═══ VERIFY ═══
console.log('═══════════════════════════════════════');
console.log('PAW U — SillyTavern VERSION');
console.log('═══════════════════════════════════════');

let issues = 0, totalEN = 0, totalRU = 0;
for (const [id, e] of Object.entries(data.entries)) {
  let enK = 0, ruK = 0;
  for (const k of e.key) {
    if (!/^\/.*\/[a-z]*$/.test(k)) { console.log('PLAIN: [' + id + '] ' + k); issues++; }
    if (/[а-яёА-ЯЁ]/.test(k)) ruK++; else enK++;
  }
  totalEN += enK; totalRU += ruK;
  if (e.selective && (!e.keysecondary || !e.keysecondary.length)) { console.log('BROKEN_SEL: [' + id + ']'); issues++; }
  if (!e.key.length) { console.log('EMPTY: [' + id + '] ' + e.comment); issues++; }
  const s = new Set(e.key); if (s.size < e.key.length) { console.log('DUPE: [' + id + '] ' + e.comment); issues++; }
}

console.log('Keys converted: ' + converted);
console.log('EN: ' + totalEN + ' | RU: ' + totalRU + ' | Total: ' + (totalEN + totalRU));
console.log('Entries without EN: ' + Object.values(data.entries).filter(e => !e.key.some(k => !/[а-яёА-ЯЁ]/.test(k))).length);
console.log('Entries without RU: ' + Object.values(data.entries).filter(e => !e.key.some(k => /[а-яёА-ЯЁ]/.test(k))).length);
console.log(issues ? issues + ' issues' : 'All clean!');
console.log('Output: ' + OUTPUT);

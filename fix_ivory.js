const fs = require('fs');
const FILE = 'D:/Загрузки/Новая папка/IVORY BLOOM  GENERAL (gena) (2).json';
const data = JSON.parse(fs.readFileSync(FILE, 'utf-8'));

// ═══ HELPERS ═══
function isRu(s) { return /[а-яёА-ЯЁ]/.test(s); }
function isRegex(s) { return /^\/.*\/[a-z]*$/.test(s); }
function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function enRegex(w) { return `/\\b${esc(w).replace(/\s+/g,'\\s+')}\\b/i`; }

function ruStemRegex(w) {
  if (w.includes(' ')) return `/(?:^|[^а-яёА-ЯЁ])${esc(w).replace(/\s+/g,'\\s+')}(?=[^а-яёА-ЯЁ]|$)/i`;
  let s = w;
  if (/(?:ый|ий|ой|ая|яя|ое|ее|ые|ие)$/.test(s) && s.length > 4) s = s.slice(0, -2);
  else if (/(?:ость|есть)$/.test(s) && s.length > 5) s = s.slice(0, -1);
  else if (/(?:ние|тие|ция|зия)$/.test(s) && s.length > 5) s = s.slice(0, -1);
  else if (/[ая]$/.test(s) && s.length > 3) s = s.slice(0, -1);
  else if (/ь$/.test(s) && s.length > 3) s = s.slice(0, -1);
  else if (/[ыи]$/.test(s) && s.length > 4) s = s.slice(0, -1);
  else if (/[ое]$/.test(s) && s.length > 3) s = s.slice(0, -1);
  if (s.length < 3) return `/(?:^|[^а-яёА-ЯЁ])${esc(w)}(?=[^а-яёА-ЯЁ]|$)/i`;
  return `/(?:^|[^а-яёА-ЯЁ])${esc(s)}[а-яёА-ЯЁ]*(?=[^а-яёА-ЯЁ]|$)/i`;
}

function ruExact(w) {
  if (w.includes(' ')) return `/(?:^|[^а-яёА-ЯЁ])${esc(w).replace(/\s+/g,'\\s+')}(?=[^а-яёА-ЯЁ]|$)/i`;
  return `/(?:^|[^а-яёА-ЯЁ])${esc(w)}(?=[^а-яёА-ЯЁ]|$)/i`;
}

const NO_STEM = new Set(['Стёпа','Стёпе','Стёпой','Стёпка','Стёпке','Стёпкой','мана']);

function convert(k) {
  if (isRegex(k)) return k;
  if (isRu(k)) return NO_STEM.has(k) ? ruExact(k) : ruStemRegex(k);
  return enRegex(k);
}

// ═══ KEYWORD REWRITES — fix broad keywords ═══
const NEW_KEYS = {
  '6': [ // Mage Exhaustion — remove "exhaustion","spent","drained","выгорание"
    "mage exhaustion", "overuse of magic", "magical drain",
    "истощение мага", "перерасход магии", "магическое истощение",
  ],

  '8': [ // World History — remove generic "history","timeline"
    "world history", "Era of Wonders", "Great War", "Contact", "New Era",
    "история мира", "хронология", "Эра Чудес", "Великая Война", "Контакт", "Новая Эра",
  ],

  '20': [ // Humans — remove "human","people","человек","люди" (matches EVERYTHING)
    "humans", "mankind", "humanity", "human race",
    "человечество", "людская раса", "род людской",
  ],

  '22': [ // Dorn — remove "underground","subterranean","подземный"
    "Dorn", "dwarf", "dwarves", "dwarven",
    "Дорн", "гном", "гномы",
  ],

  '24': [ // Kiratis — remove "marked","tainted"
    "Kiratis", "demon blood", "touched by demon",
    "Криратис", "полукровка демона", "отмеченный демоном",
  ],

  '38': [ // Silence — remove "atheism","nihilism" (generic philosophy terms)
    "The Silence", "Silence movement", "no gods no magic",
    "Молчание", "движение Молчания",
  ],

  '42': [ // Regional Conflicts — remove standalone "войны","война"
    "regional conflict", "civil war", "rebellion", "local war",
    "региональный конфликт", "гражданская война", "восстание",
  ],

  '43': [ // Personal Conflicts — remove meta terms
    "personal conflict", "personal stakes",
    "личный конфликт", "личные ставки",
  ],

  '44': [ // Stepan — collapse manual inflections to stems
    "Stepan", "Styopa", "Oblakov",
    "Степан", "Стёпа", "Стёпка", "Облаков",
  ],
};

// ═══ RECURSION HUBS ═══
const ALLOW_RECURSION = new Set([
  '4',  // Magical World
  '8',  // World History
  '15', // Era of Bloom
]);

// ═══ TRANSFORM ═══
let stats = { selective: 0, converted: 0, rewritten: 0 };

for (const [id, e] of Object.entries(data.entries)) {
  // Skip system entries
  if (parseInt(id) >= 45) continue;

  // 1. Fix selective
  if (e.selective && (!e.keysecondary || e.keysecondary.length === 0)) {
    e.selective = false;
    stats.selective++;
  }

  // 2. Keys
  const newKeys = NEW_KEYS[id];
  if (newKeys) {
    e.key = newKeys.map(convert);
    stats.rewritten++;
  } else {
    e.key = e.key.map(k => { stats.converted++; return convert(k); });
  }

  // 3. Recursion
  if (!e.constant) {
    const allow = ALLOW_RECURSION.has(id);
    e.preventRecursion = !allow;
    if (e.extensions) e.extensions.prevent_recursion = !allow;
  }
}

// 4. Trim entry 28 (Airre, ~504t → ≤500t)
const airre = data.entries['28'];
if (airre) {
  const lastBracket = airre.content.lastIndexOf(']');
  if (lastBracket > 0) {
    const after = airre.content.substring(lastBracket + 1).trim();
    if (after.length > 50) {
      const firstSentence = after.match(/^[^.!?]+[.!?]/);
      airre.content = airre.content.substring(0, lastBracket + 1) + (firstSentence ? ' ' + firstSentence[0] : '');
    }
  }
}

// Also fix entries 45-46 selective
for (const id of ['45','46']) {
  if (data.entries[id] && data.entries[id].selective) {
    data.entries[id].selective = false;
    stats.selective++;
  }
}

fs.writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf-8');

console.log('═══════════════════════════════════════');
console.log(' IVORY BLOOM — FIX COMPLETE');
console.log('═══════════════════════════════════════');
console.log(`Selective fixed:    ${stats.selective}`);
console.log(`Keys converted:     ${stats.converted}`);
console.log(`Entries rewritten:  ${stats.rewritten}`);

// Verify
let issues = 0;
for (const [id, e] of Object.entries(data.entries)) {
  for (const k of (e.key||[])) {
    if (!isRegex(k)) { console.log('PLAIN: ['+id+'] '+k); issues++; }
  }
  if (e.selective && (!e.keysecondary || !e.keysecondary.length)) { console.log('BROKEN_SEL: ['+id+']'); issues++; }
}

// Oversized check
let over = 0;
for (const [id, e] of Object.entries(data.entries)) {
  const t = Math.round((e.content||'').length / 3.5);
  if (t > 500) { console.log('OVERSIZED: ['+id+'] ~'+t+'t'); over++; }
}

console.log(issues === 0 && over === 0 ? '\nAll clean!' : '\n' + (issues+over) + ' issues remaining');

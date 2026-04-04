const fs = require('fs');

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

// Short Russian names that shouldn't be stemmed
const NO_STEM = new Set(['Ева','Еве','Еву','Евой','Изя','Изе','Изю','Изей','Дана','Даня','Сева','Гена','Вова','Вове','Вову','Вовы','Паша','Лев','Коля','Лиса','Лазя','Боня','Дэн','Ден','Дена','Дену','Дэну','Дэна','Морс','Барс','Альб','Леся','Федя','Киря','ТЦ','Лёха']);

// Broad keywords to REMOVE globally (too generic)
const BROAD_REMOVE = new Set([
  'fire','mist','weed','clan','sire','Fox',
  'myth','culture','vibe','RP','camp','game','club','klub',
  'миф','мифы','культура','атмосфера','рп','клуб',
  'еда','кол','укус',
  'the district','район','the village','деревня','the settlement','посёлок',
  'the shop','les','лес','шут','врун','цикл',
]);

// Case-sensitive names (common English words)
const CASE_SENSITIVE = new Set(['Lev','Alex','Lisa','Den','Bars','Eva']);

function convert(k) {
  if (isRegex(k)) return k;
  if (k.includes('\n')) {
    // Split newline-jammed keys
    return k.split('\n').map(p => p.trim()).filter(Boolean).map(convert);
  }
  if (BROAD_REMOVE.has(k)) return null; // mark for removal

  const cs = CASE_SENSITIVE.has(k);
  if (isRu(k)) {
    return NO_STEM.has(k) ? ruExact(k, cs) : ruStemRegex(k, cs);
  }
  return enRegex(k, cs);
}

function processFile(filepath) {
  console.log('\n═══════════════════════════════════════');
  console.log('Processing: ' + filepath.split('/').pop());
  console.log('═══════════════════════════════════════');

  const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  let stats = { selective: 0, converted: 0, removed: 0, oversized: 0 };

  for (const [id, e] of Object.entries(data.entries)) {
    // 1. Fix broken selective
    if (e.selective && (!e.keysecondary || e.keysecondary.length === 0)) {
      e.selective = false;
      stats.selective++;
    }

    // 2. Convert keys to regex + remove broad
    const newKeys = [];
    for (const k of (e.key || [])) {
      const result = convert(k);
      if (result === null) { stats.removed++; continue; }
      if (Array.isArray(result)) { newKeys.push(...result); stats.converted += result.length; }
      else if (!isRegex(k)) { newKeys.push(result); stats.converted++; }
      else { newKeys.push(result); }
    }
    e.key = newKeys;

    // 3. Fix recursion — only hubs should recurse
    // Characters (pos=1/after_char) and most entries: OFF
    // Main setting/city entries: ON
    const name = (e.comment || '').toLowerCase();
    const isHub = name.includes('trupovolkov') || name.includes('vampire territory') ||
                  name.includes('base setting') || name.includes('pioneer camp') ||
                  name.includes('burevestnik') || name.includes('hyperboreev');
    if (!e.constant) {
      e.preventRecursion = !isHub;
      if (e.extensions) e.extensions.prevent_recursion = !isHub;
    }
  }

  // 4. Report oversized entries
  const oversized = [];
  for (const [id, e] of Object.entries(data.entries)) {
    const t = Math.round((e.content || '').length / 3.5);
    if (t > 450) oversized.push({ id, name: e.comment, tokens: t });
  }
  oversized.sort((a, b) => b.tokens - a.tokens);

  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');

  console.log(`Selective fixed:     ${stats.selective}`);
  console.log(`Keys converted:      ${stats.converted}`);
  console.log(`Broad keys removed:  ${stats.removed}`);
  console.log(`Entries over 450t:   ${oversized.length}`);

  if (oversized.length) {
    console.log('\nOversized entries (need trimming):');
    for (const o of oversized) {
      console.log(`  [${o.id}] ${o.name}: ~${o.tokens}t`);
    }
  }

  // Verify
  let issues = 0;
  for (const [id, e] of Object.entries(data.entries)) {
    for (const k of (e.key || [])) {
      if (!isRegex(k)) { console.log('PLAIN: [' + id + '] ' + k); issues++; }
    }
    if (e.selective && (!e.keysecondary || !e.keysecondary.length)) issues++;
    if (!e.key || e.key.length === 0) { console.log('EMPTY KEYS: [' + id + '] ' + e.comment); issues++; }
  }
  console.log(issues === 0 ? '\nAll clean!' : '\n' + issues + ' issues remaining');

  return { data, oversized };
}

// ═══ PROCESS BOTH FILES ═══

const vamp = processFile('D:/Загрузки/Новая папка/🦇Central Russia\'s Vampires  RUSSKAYA TOSKA AU🦇 (8).json');
const pish = processFile('D:/Загрузки/Новая папка/PISHCHEBLOK (1980)  RUSSKAYA TOSKA AU (1).json');

// ═══ FIX: Pishcheblok entry 11 (Trofim) has EMPTY keys ═══
const pishData = pish.data;
if (pishData.entries['11'] && pishData.entries['11'].key.length === 0) {
  pishData.entries['11'].key = [
    enRegex('Trofim'),
    enRegex('Trotil'),
    enRegex('TNT'),
    enRegex('Prokhorov'),
    ruStemRegex('Трофим'),
    ruStemRegex('Тротил'),
    ruStemRegex('Прохоров'),
    ruExact('ТНТ'),
  ];
  console.log('\nFixed empty keys for Pishcheblok entry 11 (Trofim Prokhorov)');
  fs.writeFileSync('D:/Загрузки/Новая папка/PISHCHEBLOK (1980)  RUSSKAYA TOSKA AU (1).json',
    JSON.stringify(pishData, null, 2), 'utf-8');
}

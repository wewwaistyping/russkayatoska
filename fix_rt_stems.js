const fs = require('fs');
const FILE = 'D:/Загрузки/Новая папка/RUSSKAYA TOSKA CHAPTER 2 UPDATE Kesha (5).json';
const data = JSON.parse(fs.readFileSync(FILE, 'utf-8'));

function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function exact(w) { return `/(?:^|[^а-яёА-ЯЁ])${esc(w)}(?=[^а-яёА-ЯЁ]|$)/i`; }

const fixes = {
  '8':  { bad: 'Фед[а-яёА-ЯЁ]*', good: exact('Федя') },
  '11': { bad: 'Лев[а-яёА-ЯЁ]*', good: `/(?:^|[^а-яёА-ЯЁ])Лев(?=[^а-яёА-ЯЁ]|$)/` }, // case-sensitive
  '17': { bad: 'Дэн[а-яёА-ЯЁ]*', good: exact('Дэн') },
  '20': { bad: 'Дан[а-яёА-ЯЁ]*', good: exact('Дана') },
  '26': { bad: 'Даш[а-яёА-ЯЁ]*', good: exact('Даша') },
  '30': { bad: 'Тол[а-яёА-ЯЁ]*', good: exact('Толя') },
  '37': { bad: 'Сав[а-яёА-ЯЁ]*', good: exact('Савва') },
  '47': { bad: 'леш[а-яёА-ЯЁ]*', good: exact('леший') },
  '50': { bad: 'Кеш[а-яёА-ЯЁ]*', good: exact('Кеша') },
  '52': { bad: 'Иль[а-яёА-ЯЁ]*', good: exact('Илья') },
  '57': { bad: 'Лёх[а-яёА-ЯЁ]*', good: exact('Лёха') },
};

let fixed = 0;
for (const [id, {bad, good}] of Object.entries(fixes)) {
  const e = data.entries[id];
  if (!e) continue;
  for (let i = 0; i < e.key.length; i++) {
    if (e.key[i].includes(bad)) {
      console.log(`[${id}] ${e.key[i].substring(0, 55)}`);
      console.log(`  → ${good}`);
      e.key[i] = good;
      fixed++;
    }
  }
}

// Dedupe
let deduped = 0;
for (const e of Object.values(data.entries)) {
  const before = e.key.length;
  e.key = [...new Set(e.key)];
  deduped += before - e.key.length;
}

fs.writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf-8');
console.log(`\nFixed ${fixed} stems, deduped ${deduped}`);

// Re-verify
let remaining = 0;
for (const [id, e] of Object.entries(data.entries)) {
  for (const k of e.key) {
    const m = k.match(/ЯЁ\]\)([а-яёА-ЯЁ]{1,3})\[а-яёА-ЯЁ\]\*\(\?=/);
    if (m) { console.log(`Still short: [${id}] «${m[1]}» ← ${k.substring(0,50)}`); remaining++; }
  }
}
console.log(`Remaining short stems: ${remaining}`);

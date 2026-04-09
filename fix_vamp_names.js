const fs = require('fs');
const FILE = 'D:/Загрузки/Новая папка/🦇Central Russia\'s Vampires  RUSSKAYA TOSKA AU🦇 (8).json';
const data = JSON.parse(fs.readFileSync(FILE, 'utf-8'));

let fixed = 0;

for (const [id, e] of Object.entries(data.entries)) {
  for (let i = 0; i < e.key.length; i++) {
    const k = e.key[i];

    // ═══ ЛЕВ: remove /i → case-sensitive (won't match "лев" animal) ═══
    if (k === '/(?:^|[^а-яёА-ЯЁ])Лев(?=[^а-яёА-ЯЁ]|$)/i') {
      e.key[i] = '/(?:^|[^а-яёА-ЯЁ])Лев(?=[^а-яёА-ЯЁ]|$)/';
      console.log(`[${id}] Лев → case-sensitive`);
      fixed++;
    }
    // Патриарх Лев — also case-sensitive
    if (k.includes('Патриарх\\s+Лев') && k.endsWith('/i')) {
      e.key[i] = k.slice(0, -1); // remove the 'i'
      console.log(`[${id}] Патриарх Лев → case-sensitive`);
      fixed++;
    }

    // ═══ МАКСИМ: stem → exact (won't match "максимально") ═══
    if (k === '/(?:^|[^а-яёА-ЯЁ])Максим[а-яёА-ЯЁ]*(?=[^а-яёА-ЯЁ]|$)/i') {
      e.key[i] = '/(?:^|[^а-яёА-ЯЁ])Максим(?=[^а-яёА-ЯЁ]|$)/i';
      console.log(`[${id}] Максим~ → exact Максим`);
      fixed++;
    }
    // Максим Страхов compound — exact Максим in compound
    if (k.includes('Максим[а-яёА-ЯЁ]*\\s+Страхов')) {
      e.key[i] = k.replace('Максим[а-яёА-ЯЁ]*', 'Максим');
      console.log(`[${id}] Максим~ Страхов → exact Максим Страхов`);
      fixed++;
    }

    // ═══ МАКСИМИЛИАН: stem → exact ═══
    if (k.includes('Максимилиан[а-яёА-ЯЁ]*')) {
      e.key[i] = k.replace('Максимилиан[а-яёА-ЯЁ]*', 'Максимилиан');
      console.log(`[${id}] Максимилиан~ → exact`);
      fixed++;
    }
    // Максим Левин compound in entry 33
    if (k.includes('Максим[а-яёА-ЯЁ]*\\s+Левин')) {
      e.key[i] = k.replace('Максим[а-яёА-ЯЁ]*', 'Максим');
      console.log(`[${id}] Максим~ Левин → exact Максим Левин`);
      fixed++;
    }

    // ═══ EVA EN: make case-sensitive (won't match "evaluate", "eve") ═══
    if (k === '/\\bEva\\b/i') {
      e.key[i] = '/\\bEva\\b/';
      console.log(`[${id}] Eva → case-sensitive`);
      fixed++;
    }
    // Lev EN: already case-sensitive (/\bLev\b/) — check
    if (k === '/\\bLev\\b/i') {
      e.key[i] = '/\\bLev\\b/';
      console.log(`[${id}] Lev EN → case-sensitive`);
      fixed++;
    }
    // Max EN
    if (k === '/\\bMax\\b/i') {
      e.key[i] = '/\\bMax\\b/';
      console.log(`[${id}] Max EN → case-sensitive`);
      fixed++;
    }
  }
}

// Dedupe
for (const e of Object.values(data.entries)) { e.key = [...new Set(e.key)]; }

fs.writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf-8');
console.log(`\nFixed ${fixed} keys`);

// Verify
let issues = 0;
for (const [id, e] of Object.entries(data.entries)) {
  for (const k of e.key) {
    if (k === '/(?:^|[^а-яёА-ЯЁ])Лев(?=[^а-яёА-ЯЁ]|$)/i') { console.log(`STILL: [${id}] Лев /i`); issues++; }
    if (k === '/(?:^|[^а-яёА-ЯЁ])Максим[а-яёА-ЯЁ]*(?=[^а-яёА-ЯЁ]|$)/i') { console.log(`STILL: [${id}] Максим~`); issues++; }
    if (k === '/\\bEva\\b/i') { console.log(`STILL: [${id}] Eva /i`); issues++; }
  }
}
console.log(issues ? issues + ' remaining' : 'ALL CLEAN!');

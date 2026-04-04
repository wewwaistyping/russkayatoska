const fs = require('fs');

const INPUT = 'D:/Загрузки/Новая папка/🍁SACRAMENT🍁GEN I (3).json';
const OUTPUT = 'D:/Загрузки/Новая папка/🍁SACRAMENT🍁GEN I (REGEX).json';

const data = JSON.parse(fs.readFileSync(INPUT, 'utf-8'));

// ═══════════════════════════════════════════════════════════
// REGEX HELPERS
// ═══════════════════════════════════════════════════════════

function isRu(s) { return /[а-яёА-ЯЁ]/.test(s); }
function isAlreadyRegex(s) { return /^\/.*\/[a-z]*$/.test(s); }
function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function enRegex(word, cs = false) {
  const p = esc(word).replace(/\s+/g, '\\s+');
  return cs ? `/\\b${p}\\b/` : `/\\b${p}\\b/i`;
}

function ruGetStem(word) {
  if (word.includes(' ')) return { stem: word, exact: true };
  let s = word;
  if (/(?:ый|ий|ой|ая|яя|ое|ее|ые|ие)$/.test(s) && s.length > 4) return { stem: s.slice(0, -2), exact: false };
  if (/(?:ость|есть)$/.test(s) && s.length > 5) return { stem: s.slice(0, -1), exact: false };
  if (/(?:ние|тие|ция|зия)$/.test(s) && s.length > 5) return { stem: s.slice(0, -1), exact: false };
  if (/[ая]$/.test(s) && s.length > 3) return { stem: s.slice(0, -1), exact: false };
  if (/ь$/.test(s) && s.length > 3) return { stem: s.slice(0, -1), exact: false };
  if (/[ыи]$/.test(s) && s.length > 4) return { stem: s.slice(0, -1), exact: false };
  if (/[ое]$/.test(s) && s.length > 3) return { stem: s.slice(0, -1), exact: false };
  return { stem: s, exact: false };
}

function ruStemRegex(word, cs = false) {
  const flag = cs ? '/' : '/i';
  if (word.includes(' ')) {
    const p = esc(word).replace(/\s+/g, '\\s+');
    return `/(?:^|[^а-яёА-ЯЁ])${p}(?=[^а-яёА-ЯЁ]|$)${flag}`;
  }
  const { stem } = ruGetStem(word);
  if (stem.length < 3) return `/(?:^|[^а-яёА-ЯЁ])${esc(word)}(?=[^а-яёА-ЯЁ]|$)${flag}`;
  return `/(?:^|[^а-яёА-ЯЁ])${esc(stem)}[а-яёА-ЯЁ]*(?=[^а-яёА-ЯЁ]|$)${flag}`;
}

function ruExactRegex(word, cs = false) {
  const flag = cs ? '/' : '/i';
  if (word.includes(' ')) {
    const p = esc(word).replace(/\s+/g, '\\s+');
    return `/(?:^|[^а-яёА-ЯЁ])${p}(?=[^а-яёА-ЯЁ]|$)${flag}`;
  }
  return `/(?:^|[^а-яёА-ЯЁ])${esc(word)}(?=[^а-яёА-ЯЁ]|$)${flag}`;
}

// ═══════════════════════════════════════════════════════════
// CASE-SENSITIVE & NO-STEM SETS
// ═══════════════════════════════════════════════════════════

const CASE_SENSITIVE = new Set([
  'Roman', 'Ro', 'Rose', 'Val', 'Eve', 'Moss', 'Mars',
  'Роман', 'Ро', 'Роуз', 'Вал', 'Ив', 'Мосс', 'Марс',
]);

const NO_STEM_RU = new Set([
  'Нико', 'Ро', 'Ив', 'Вал', 'Хлоя', 'Мосс', 'Тео',
]);

// ═══════════════════════════════════════════════════════════
// COMPLETE KEYWORD REWRITE — EVERY ENTRY
// ═══════════════════════════════════════════════════════════
// null = keep original keywords (already specific enough)
// [...] = replace with these exact keywords (gets regex-converted)

const NEW_KEYS = {
  // ═══ CONSTANT (always injected, keywords irrelevant) ═══
  '0': null,
  '11': null,

  // ═══ BLOOM LORE ═══
  '1': null, // Bloom Biochemistry — already specific compound terms ✓

  '2': [ // Generational Evolution — remove generic "generations"
    "first generation", "second generation", "third generation",
    "bloom evolution", "gifted generations", "history of blooming",
    "первое поколение", "второе поколение", "третье поколение",
    "эволюция цветения", "поколения одарённых", "история цветения",
  ],

  '3': null, // Bloom Origin Theories — already specific ✓

  '10': [ // Bloom Phenomenon — remove "flowering","manifestation","blooming"
    "the bloom", "bloom phenomenon", "flowers appear",
    "цветение", "феномен цветения", "цветы появляются",
    "зацвести", "зацветать",
  ],

  '12': null, // Floriography — already specific ✓

  '13': [ // Gift Resonance — remove "synergy"
    "gift resonance", "resonance", "ability fusion",
    "combined powers", "emotional outburst",
    "резонанс", "резонанс даров",
    "слияние способностей", "объединённые силы", "эмоциональный всплеск",
  ],

  '14': null, // Flower Compatibility — already specific ✓

  // ═══ UNIVERSITY STRUCTURE ═══
  '4': [ // SACRAMENT University — names + campus only
    "Sacrament", "SACRAMENT University", "campus",
    "Сакрамент", "университет Сакрамент", "кампус",
  ],

  '6': [ // Founder — names only, remove generic "who built"
    "Adam Thompson", "Lily Thompson", "founder",
    "Адам Томпсон", "Лили Томпсон", "основатель",
  ],

  '7': [ // Admission — specific compound terms
    "admission", "enrollment", "how to get in",
    "поступление", "зачисление", "как поступить",
  ],

  '8': [ // Safety Policy — remove "safety","demonstration"
    "public display", "hiding powers", "secrecy", "going public",
    "публичная демонстрация", "скрывать силы", "секретность", "огласка",
  ],

  '9': [ // Research Ethics — compound terms only
    "psychological tests", "ability testing", "bloom experiments",
    "психологические тесты", "тестирование способностей", "эксперименты с блумингом",
  ],

  '15': [ // Academic Curriculum — remove "classes","courses","schedule","subjects"
    "curriculum", "what do students study",
    "учебная программа", "что изучают студенты",
  ],

  '16': null, // Bloom Development — already specific bloom terms ✓
  '17': null, // Bloom Showcases — already specific ✓

  '18': [ // Mentoring — remove "adaptation"
    "mentoring", "mentorship", "senior mentor", "freshman help",
    "менторство", "наставничество", "наставник", "помощь первокурсникам",
  ],

  '19': [ // Student Clubs — remove "activities","club","hobbies"
    "university clubs", "student clubs", "extracurricular",
    "университетские клубы", "студенческие клубы", "внеучебная деятельность",
  ],

  '20': [ // Welcoming Ceremony — remove "initiation","vow"
    "welcoming ceremony", "freshman ceremony", "candle ceremony",
    "церемония приветствия", "церемония первокурсников", "церемония свечей",
  ],

  '21': null, // Revelation Night — already specific ✓
  '22': null, // Alumni — already specific ✓

  // ═══ CAMPUS LOCATIONS — proper names only, no generic words ═══
  '23': [ // Thompson Hall
    "Thompson Hall", "main building",
    "Томпсон Холл", "главное здание",
  ],

  '24': [ // Dormitories — dorm names only
    "dormitory", "dorm", "dorms",
    "Lily Hall", "Iris House", "Willow Hall", "Magnolia House",
    "общежитие", "общага",
    "Лили Холл", "Ирис Хаус", "Уиллоу Холл", "Магнолия Хаус",
  ],

  '25': [ // Academic Halls — remove "classroom","classes"
    "lecture hall", "auditorium",
    "лекционный зал", "аудитория",
  ],

  '26': [ // Science Wing — remove generic "lab"
    "science wing", "laboratory", "psych lab", "bloom research",
    "научный корпус", "лаборатория", "псих лаба", "исследования блуминга",
  ],

  '27': [ // Library — university-specific only
    "university library", "restricted section",
    "университетская библиотека", "закрытая секция",
  ],

  '28': [ // Athletic Center — remove "gym","sports","fitness","workout"
    "gymnasium", "athletic center",
    "спортзал", "спортивный центр",
  ],

  '29': [ // Pine Point — proper name only
    "Pine Point", "Пайн Поинт",
  ],

  '30': [ // Campus Transport — specific compound terms
    "campus bus", "shuttle", "how to get to campus",
    "автобус до кампуса", "шаттл", "как добраться до кампуса",
  ],

  // ═══ TOWN & TOWN LOCATIONS — proper names only ═══
  '5': [ // Mills Crossing
    "Mills Crossing", "Миллс Кроссинг",
  ],

  '31': [ // The Locals — specific compound terms
    "townsfolk", "Mills Crossing people", "town attitude",
    "горожане", "люди Миллс Кроссинг", "отношение города",
  ],

  '32': [ // Sheriff Reed — name + title
    "sheriff", "Sheriff Reed", "Evelyn Reed",
    "шериф", "шериф Рид", "Эвелин Рид",
  ],

  '33': [ // Mayor Hayes — name + title
    "mayor", "Mayor Hayes", "William Hayes",
    "мэр", "мэр Хейс", "Уильям Хейс",
  ],

  '34': [ // Main Street — proper name, remove "shops"
    "Main Street", "downtown",
    "Мейн Стрит", "центр города",
  ],

  '35': [ // Diner — proper name, remove "restaurant","cafe","breakfast"
    "diner", "Diner by the Bridge", "Millers",
    "дайнер", "закусочная у моста", "Миллеры",
  ],

  '36': [ // Motel — proper name + owner
    "Crossroads Motel", "cabins", "Bill Harding",
    "мотель Перекрёсток", "домики", "Билл Хардинг",
  ],

  '37': [ // Miramere Lake — proper name ONLY, no "lake","swimming","beach"
    "Miramere Lake", "Miramere",
    "озеро Мирамер", "Мирамер",
  ],

  '38': [ // Museum — proper name only
    "Timber Heritage Museum",
    "музей леса и наследия",
  ],

  '39': [ // Sleeping Giant — proper name ONLY, no "forest","woods","hiking"
    "Sleeping Giant", "Sleeping Giant Forest",
    "Спящий Гигант", "лес Спящего Гиганта",
  ],

  '40': [ // Spruce Goose — proper name only, no "coffee","cafe"
    "Spruce Goose", "Еловый Гусь",
  ],

  '41': [ // Pixel Pines — proper name only, no "games","pinball"
    "Pixel Pines", "arcade",
    "Пиксельные Сосны", "аркада",
  ],

  '42': [ // Public Library — compound name + librarian name
    "public library", "town library", "Ms Gable",
    "публичная библиотека", "городская библиотека", "мисс Гейбл",
  ],

  '43': [ // Verdant — proper name + unique descriptors
    "Verdant Vegetation", "speakeasy", "secret bar", "gifted bar",
    "Пыльная Растительность", "спикизи", "тайный бар", "бар для одарённых",
  ],

  '44': [ // Wooden Anchor — proper name + owner
    "Wooden Anchor", "tavern", "Bill O'Malley",
    "Деревянный Якорь", "таверна", "Билл О'Мэлли",
  ],

  '45': [ // Pine Cone Festival — proper name only
    "Pine Cone Festival", "Loggers Day",
    "Фестиваль Сосновой Шишки", "День Лесорубов",
  ],

  // ═══ LEGENDS & SECRETS ═══
  '46': null, // Lady of the Lake — already specific ✓
  '47': null, // Girl in Red — already specific ✓

  '48': [ // Polaroids — remove "have you seen"
    "polaroids", "mysterious photos", "polaroid photos", "missing poster", "creepy photos",
    "полароиды", "загадочные фото", "полароидные фото", "постер о пропаже", "жуткие фото",
  ],

  '49': [ // Rose Bly (SECRET) — name only, remove "her name"
    "Rose Bly", "Rose", "girl in red name", "who was she",
    "Роуз Блай", "Роуз", "имя девушки в красном", "кто она была",
  ],

  '50': [ // Rose & Damien (SECRET) — remove "they were together"
    "Rose and Damien", "Damien affair", "secret relationship", "Damien girlfriend",
    "Роуз и Дэмиен", "интрижка Дэмиена", "тайные отношения", "девушка Дэмиена",
  ],

  '51': [ // Halloween Incident (SECRET) — remove "what happened"
    "Halloween incident", "Halloween argument", "the night she vanished",
    "Halloween party", "Rose true fate", "where is Rose",
    "living ghost", "perception filter", "is she alive",
    "инцидент на Хэллоуин", "ссора на Хэллоуин", "ночь когда она исчезла",
    "вечеринка на Хэллоуин", "истинная судьба Роуз", "где Роуз",
    "живой призрак", "фильтр восприятия", "она жива",
  ],

  '52': null, // Conditions for Return — already specific ✓

  // ═══ PROFESSORS — names + unique trait ═══
  '53': [ // Prof Finch
    "Professor Finch", "Alistair Finch", "Finch", "esoteric club",
    "профессор Финч", "Алистер Финч", "Финч", "клуб эзотерики",
  ],

  '54': [ // Prof Thorne — remove "psychology head","clinical psychology"
    "Professor Thorne", "James Thorne", "Dr Thorne", "Roman's father",
    "профессор Торн", "Джеймс Торн", "доктор Торн", "отец Романа",
  ],

  '55': [ // Prof Whitepond — keep "Duchess" (unique)
    "Professor Whitepond", "Lady Whitepond", "Louise Whitepond", "Duchess",
    "профессор Уайтпонд", "леди Уайтпонд", "Луиза Уайтпонд", "герцогиня",
  ],

  // ═══ SUPPORT NPCS — names + unique role ═══
  '56': [ // Elodie — remove "graduate student","ability development"
    "Elodie", "Elodie Lavigne", "Lavigne", "bloom coach",
    "Элоди", "Элоди Лавин", "Лавин", "коуч по блумингу",
  ],

  '57': [ // Marcus — remove "recruiter","writer"
    "Marcus", "Marcus Leroy", "Leroy", "talent scout",
    "Маркус", "Маркус Лерой", "Лерой", "скаут талантов",
  ],

  '58': [ // Elara — remove "botany professor","retired professor"
    "Elara", "Elara Vance", "Vance", "Verdant owner",
    "Элара", "Элара Вэнс", "Вэнс", "владелица Вердант",
  ],

  // ═══ MAIN CHARACTERS — names + bloom flower + 1 unique trait ═══
  '59': [ // Roman 'Ro' Thorne — remove "psychology student"
    "Roman", "Ro", "Thorne", "Roman Thorne", "gloved boy",
    "Роман", "Ро", "Торн", "Роман Торн", "парень в перчатках",
  ],

  '60': [ // Nico — names only + flower, remove all generic descriptors
    "Nico", "Ferrari", "Nico Ferrari", "marigold",
    "Нико", "Феррари", "Нико Феррари", "бархатцы",
  ],

  '61': [ // Caleb — names only, remove "artist","musician","Fine Arts"
    "Caleb", "Lockhart", "Caleb Lockhart",
    "Калеб", "Локхарт", "Калеб Локхарт",
  ],

  '62': [ // Chloe — names + student council
    "Chloe", "Collins", "Chloe Collins", "student council",
    "Хлоя", "Коллинз", "Хлоя Коллинз", "студсовет",
  ],

  '63': [ // Damien — "golden boy" is unique
    "Damien", "Sinclair", "Damien Sinclair", "golden boy", "laurel",
    "Дэмиен", "Синклер", "Дэмиен Синклер", "золотой мальчик", "лавр",
  ],

  '64': [ // Andy — "thistle" is his bloom
    "Andy", "Andrew", "Gallagher", "Andy Gallagher", "Andrew Gallagher", "thistle",
    "Энди", "Эндрю", "Галлахер", "Энди Галлахер", "чертополох",
  ],

  '65': [ // Archer — "poet" is unique in this cast
    "Archer", "Stewart", "Archer Stewart", "poet",
    "Арчер", "Стюарт", "Арчер Стюарт", "поэт",
  ],

  '66': [ // Val — "poppy" is his bloom, "Spruce Goose" intentional collision
    "Val", "Valerian", "Moss", "Valerian Moss", "poppy", "Spruce Goose",
    "Вал", "Валериан", "Мосс", "Валериан Мосс", "мак",
  ],

  '67': [ // Theo — "Verdant" intentional collision, "hurricane" is unique
    "Theo", "Rossi", "Theo Rossi", "Theodore", "Verdant", "hurricane",
    "Тео", "Росси", "Тео Росси", "Теодор", "ураган",
  ],

  '68': [ // Eve — "eternal third-year" is SUPER unique
    "Eve", "Rottengrass", "Eve Rottengrass", "eternal third-year", "mascot",
    "Ив", "Роттенграсс", "Ив Роттенграсс", "вечная третьекурсница", "талисман",
  ],

  '69': [ // Alexander — remove "memory","law student"
    "Alexander", "Kogan", "Alexander Kogan", "mediator", "Alexander of Macedon",
    "Александр", "Коган", "Александр Коган", "медиатор", "Александр Македонский",
  ],

  '70': [ // Red Cardinals — collapsed inflections, full player names
    "Red Cardinals", "Cardinals", "basketball team",
    "Красные кардиналы", "Кардинал", "баскетбольная команда",
    "Mars", "Mark Johnson", "JJ", "Jamal Jackson",
    "Derek Williams", "Tyler Chen", "Ryan O'Brien",
    "Марс", "Марк Джонсон", "ДжейДжей",
    "/(?:^|[^а-яёА-ЯЁ])Джей-?Джей(?=[^а-яёА-ЯЁ]|$)/i",
    "Джамал", "Дерек", "Тайлер", "Райан",
  ],

  '71': [ // Felix — collapsed inflections
    "Félix Curie", "Félix", "Felix", "Iceman",
    "Феликс Кюри", "Феликс", "Айсмен", "Айсмэн",
  ],
};

// ═══════════════════════════════════════════════════════════
// FIX BROKEN SELECTIVE
// ═══════════════════════════════════════════════════════════

const FIX_SELECTIVE = ['3', '27', '56', '60', '65', '70', '71'];

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

let stats = { entries: 0, rewritten: 0, kept: 0, selectiveFixed: 0 };

for (const [id, entry] of Object.entries(data.entries)) {
  stats.entries++;

  // Fix broken selective
  if (FIX_SELECTIVE.includes(id) && entry.selective) {
    entry.selective = false;
    stats.selectiveFixed++;
  }

  const newKeys = NEW_KEYS[id];

  if (newKeys === null) {
    // Keep original but convert to regex
    entry.key = entry.key.map(k => convertKeyword(k));
    stats.kept++;
  } else if (newKeys !== undefined) {
    // Full rewrite
    entry.key = newKeys.map(k => convertKeyword(k));
    stats.rewritten++;
  }

  // Convert secondaries too
  if (entry.keysecondary && entry.keysecondary.length > 0) {
    entry.keysecondary = entry.keysecondary.map(k => convertKeyword(k));
  }
}

// ═══════════════════════════════════════════════════════════
// OUTPUT
// ═══════════════════════════════════════════════════════════

fs.writeFileSync(OUTPUT, JSON.stringify(data, null, 2), 'utf-8');

console.log('═══════════════════════════════════════════');
console.log(' LOREBOOK v2 — FULL REWRITE COMPLETE');
console.log('═══════════════════════════════════════════');
console.log(`Total entries:       ${stats.entries}`);
console.log(`Keywords rewritten:  ${stats.rewritten}`);
console.log(`Keywords kept as-is: ${stats.kept}`);
console.log(`Selective fixed:     ${stats.selectiveFixed}`);
console.log(`Output: ${OUTPUT}`);
console.log();

// Count keywords per entry
const allEntries = Object.entries(data.entries);
const keyCounts = allEntries.map(([id, e]) => ({ id, name: e.comment, count: e.key.length }));
keyCounts.sort((a, b) => a.count - b.count);

console.log('═══ KEYWORD COUNT DISTRIBUTION ═══');
console.log(`Min: ${keyCounts[0].count} (${keyCounts[0].name})`);
console.log(`Max: ${keyCounts[keyCounts.length-1].count} (${keyCounts[keyCounts.length-1].name})`);
console.log(`Total keywords: ${keyCounts.reduce((s, e) => s + e.count, 0)}`);
console.log();

console.log('═══ ENTRIES WITH ≤ 4 KEYWORDS ═══');
for (const e of keyCounts.filter(e => e.count <= 4)) {
  console.log(`  [${e.id}] ${e.name}: ${e.count} keys`);
}
console.log();

// Collision check
const kwMap = {};
for (const [id, e] of allEntries) {
  for (const k of e.key) {
    if (!kwMap[k]) kwMap[k] = [];
    kwMap[k].push({ id, name: e.comment });
  }
}
const collisions = Object.entries(kwMap).filter(([k, v]) => v.length > 1);
console.log(`═══ COLLISIONS: ${collisions.length} ═══`);
for (const [kw, ents] of collisions) {
  const short = kw.length > 50 ? kw.substring(0, 47) + '...' : kw;
  console.log(`  ${short}`);
  for (const e of ents) console.log(`    → [${e.id}] ${e.name}`);
}

// Test: what would trigger from user's prompt
console.log();
console.log('═══ TRIGGER TEST ═══');
console.log('Prompt: "кампуса Сакрамент Andy студенческими делами"');
const testText = 'кампуса Сакрамент Andy студенческими делами';
let triggered = [];
for (const [id, e] of allEntries) {
  if (e.constant) { triggered.push(`[${id}] ${e.comment} (CONSTANT)`); continue; }
  for (const k of e.key) {
    // Extract regex pattern
    const match = k.match(/^\/(.+)\/([a-z]*)$/);
    if (match) {
      try {
        const re = new RegExp(match[1], match[2]);
        if (re.test(testText)) {
          triggered.push(`[${id}] ${e.comment} ← ${k}`);
          break;
        }
      } catch(e) {}
    }
  }
}
console.log(`Triggered: ${triggered.length} entries`);
for (const t of triggered) console.log(`  ${t}`);

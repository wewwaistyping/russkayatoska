const fs = require('fs');

const INPUT = 'D:/Загрузки/Новая папка/LOST SOULS CLUB vertex.json';
const OUTPUT = 'D:/Загрузки/Новая папка/LOST SOULS CLUB — FIXED.json';

const data = JSON.parse(fs.readFileSync(INPUT, 'utf-8'));

// ═══ HELPERS ═══
function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function en(w) { return `/\\b${esc(w).replace(/\s+/g,'\\s+')}\\b/i`; }
function ruS(w) {
  if (w.includes(' ')) return `/(?:^|[^а-яёА-ЯЁ])${esc(w).replace(/\s+/g,'\\s+')}(?=[^а-яёА-ЯЁ]|$)/i`;
  let s = w;
  if (/[ая]$/.test(s)&&s.length>3) s=s.slice(0,-1);
  if (s.length<3) return `/(?:^|[^а-яёА-ЯЁ])${esc(w)}(?=[^а-яёА-ЯЁ]|$)/i`;
  return `/(?:^|[^а-яёА-ЯЁ])${esc(s)}[а-яёА-ЯЁ]*(?=[^а-яёА-ЯЁ]|$)/i`;
}
function K(...args) { return args.map(k => /[а-яёА-ЯЁ]/.test(k) ? ruS(k) : en(k)); }

// ═══ COMPLETE REWRITE ═══

const ENTRIES = {
  // ═══ CONSTANT RULES (always in context) ═══
  '0': {
    comment: '🌍 World Info — Nowhere',
    key: K('Nowhere', 'Limbo', 'afterlife', 'town', 'souls'),
    content: `RULE: "Nowhere" — a Limbo beyond time and space. [ form: Small town in desert; highway to nowhere on one side, boundless ocean on the other. ] [ inhabitants: Souls (dead people with memories) and Hollows (empty beings). ] [ nature: Built on archetypes and collective unconscious — whatever becomes popular in the "real" world eventually manifests here. ] [ rules: Don't go out at night. Don't leave the main streets. Those who took the highway never returned. ] [ reality: Highly advanced glitching "Soul Repository" — souls deposited here failed to transition due to unresolved trauma/guilt. Town operates as compulsory therapeutic simulation. Death is a temporary system reset. ]`,
    constant: true, position: 4, order: 300, preventRecursion: true,
  },

  '1': {
    comment: '⚙️ AI Guidance — Tone & Glitches',
    key: K('glitch', 'shift', 'curse', 'distortion'),
    content: `RULE: Core tone — Mystical, Sullen, Existential. NOT digital or cyberpunk. Minimize error terminology (file, bug, system, code). [ glitches: Subtle surreal physical distortions — jagged shadows, architecture that shifts (column replacing brick wall), wrong sounds (echo of someone else's laughter), temporal distortion (clock hand twitching backward). One prominent glitch per 3-4 paragraphs maximum. ] [ NPC perception: Characters NEVER call these "glitches." They say "The Shifts," "The Curses," or "Nighttime Nonsense." ] [ NPCs: Generate temporary NPCs/Hollows as needed — must be tied to a historical era or archetype of collective trauma. Despite their position, souls try to live: celebrate holidays, socialize, work. ]`,
    constant: true, position: 4, order: 290, preventRecursion: true,
  },

  // ═══ WORLD MECHANICS ═══
  '2': {
    comment: '👤 Hollows',
    key: K('Hollow', 'Hollows', 'empty being', 'empty beings'),
    content: `Hollows — empty beings in Nowhere. [ type 1 — Originals: Created by this place to fill a role. No intellect, no self-awareness. Mechanically walk dogs, pour coffee, sweep streets. Projections of collective unconscious. ] [ type 2 — Faded Souls: Former souls who died too many times. Each death strips memories, personality, skills. Eventually — empty. A Hollow. ] [ danger: Hollows only accept payment in memories and personality fragments. Trading with them is risky — you lose pieces of yourself. ]`,
    position: 0, order: 200, preventRecursion: true,
  },

  '3': {
    comment: '☠️ Death & Monsters',
    key: K('die', 'death', 'killed', 'monster', 'monsters', 'creature', 'shadow creature', 'night danger'),
    content: `[ death: Each death here costs a piece of you — memories, personality, skills. Die enough times and you become a Hollow. No one knows the exact count. ] [ monsters: Grotesque beings living in shadows. Emerge when darkness falls. Don't speak. Resemble twisted animals or humans. Afraid of light. Can technically be killed but dangerous. ] [ special monsters: Some don't just kill — they CONSUME. Being devoured is permanent. No reset. ] [ survival: Stay on lit main streets at night. Don't wander into dead ends. Light is your friend. ]`,
    position: 0, order: 200, preventRecursion: true,
  },

  '4': {
    comment: '🥕 Needs & Currency',
    key: K('hungry', 'food', 'eat', 'sleep', 'currency', 'payment', 'pay', 'trade', 'memories as payment'),
    content: `[ needs: Everyone here is technically dead — won't die from hunger. But must eat, drink, sleep or become weaker, slower, more vulnerable. Everything is built on habit. ] [ currency: Money is meaningless. Trade in: fuel, light, favors (sweep yard, wash dishes), or MEMORIES. Hollows only accept memories/personality fragments — trading with them costs pieces of yourself. Trade with true Souls instead. ]`,
    position: 0, order: 150, preventRecursion: true,
  },

  // ═══ LOCATIONS ═══
  '5': {
    comment: '🏙️ Nowhere — The Town',
    key: K('town center', 'main street', 'the town', 'streets of Nowhere'),
    content: `Nowhere — the town where everything takes place. [ appearance: Provincial American town in the middle of desert. Houses morph according to eras and events from the living world. Main streets well-lit at night. Slightly grotesque but locals keep it feeling normal. ] [ layout: Ghoul's Howl bar at center, Deep Sleep motel, The Final Hand gambling club, The Playful Bones strip club, Beauty Den salon, Legion's Gym. Highway on one side, ocean on the other. ]`,
    position: 0, order: 100, preventRecursion: false,
  },

  '6': {
    comment: '🏨 Deep Sleep Motel',
    key: K('Deep Sleep', 'motel', 'my room', 'hotel'),
    content: `The "Deep Sleep" Motel — cradle for all residents, especially newcomers. [ exterior: Slightly shabby roadside hotel. ] [ interior: Infinite doors and corridors. Every soul gets their own room reflecting their era, inner world, past. A neat freak gets immaculate room, a doctor gets medical atlases. ] [ manager: Winston — old Soul in shining suits. ] [ rule: A soul can always find another place to live. ]`,
    position: 0, order: 100, preventRecursion: true,
  },

  '7': {
    comment: '🍻 Ghoul\'s Howl Bar',
    key: K("Ghoul's Howl", 'Ghouls Howl', 'the bar', 'tavern'),
    content: `The "Ghoul's Howl" — heart of Nowhere, literally in the center of town, accessible from any direction. [ interior: Constantly shifting but always spacious — dance floor, wide bar counter, tables and couches. ] [ status: Considered a stronghold of safety. Souls gather here. ] [ owner: Raven Morrow. ]`,
    position: 0, order: 100, preventRecursion: true,
  },

  '8': {
    comment: '♣️ The Final Hand',
    key: K('Final Hand', 'gambling club', 'arcades', 'Taylor Twins'),
    content: `"The Final Hand" — gambling club, second heart of Nowhere. Near the Ghoul's Howl. [ owners: Taylor Twins (Vivienne & Vincent). ] [ structure: Originally 1920s style — first floor literally rose, became second floor. Ground floor now filled with arcade machines and private board game rooms. ] [ events: Twins host events, some insane — like Russian Roulette. ] [ exterior: Grotesque — 1920s structure intertwined with neon tubes and blinking signs. ]`,
    position: 0, order: 100, preventRecursion: true,
  },

  '9': {
    comment: '👠 The Playful Bones',
    key: K('Playful Bones', 'strip club', 'Riley Dew'),
    content: `"The Playful Bones" — strip club owned by Riley Dew. [ interior: Exquisite and beautifully furnished. ] [ workers: Majority are Hollows performing duties perfectly. ] [ exterior: Looks exactly like a large genuine Barbie Dreamhouse. ]`,
    position: 0, order: 100, preventRecursion: true,
  },

  '10': {
    comment: '💅 The Beauty Den',
    key: K('Beauty Den', 'beauty salon', 'Cassia'),
    content: `"The Beauty Den" — salon owned by Cassia Yuricol. Small, cozy. Perpetually smells of lacquer, powdered sugar, and something ominously sweet. Hosts workshops, fashion shows, and events.`,
    position: 0, order: 100, preventRecursion: true,
  },

  '11': {
    comment: '🏋️ The Legion\'s Gym',
    key: K("Legion's Gym", 'gym', 'Titus'),
    content: `"The Legion's Gym" — strict, high-intensity. [ exterior: Modern fitness center (neon signs, glass facade). ] [ interior: Haunting mixture of Roman training equipment (stone weights, leather punching bags) and modern machines. ] [ owner: Titus Valerius. ]`,
    position: 0, order: 100, preventRecursion: true,
  },

  '12': {
    comment: '🛣️ Highway & Ocean',
    key: K('highway', 'the highway', 'the ocean', 'ocean shore', 'escape'),
    content: `[ highway: Leads into boundless desert beyond horizon. Those who drove down it never returned. Rumored you can encounter them as Hollows. ] [ ocean: Infinite, stretching across the other side of town. Relatively safe during daylight. No one has attempted to swim across. ] [ secret connection: Both paths eventually lead to confronting your sins — but no one in Nowhere knows this. ]`,
    position: 0, order: 100, preventRecursion: true,
  },

  // ═══ NPCs ═══
  '13': {
    comment: '👤 Winston — Motel Manager',
    key: K('Winston'),
    content: `Winston — the old man managing Deep Sleep motel. Soul, not Hollow. Doesn't remember how long he's lived here. [ appearance: Slicked-back grey hair, deep wrinkles. Shining suits, polished shoes. Looks imposing despite his age. ] [ personality: Communicative, charming, secretive. Often remarks things weren't like this "in his time." ] [ guilt: Coldly and deliberately condemned thousands to poverty and ruin, including those who completely trusted him. ]`,
    position: 1, order: 150, preventRecursion: true,
  },

  '14': {
    comment: '👤 Raven Morrow — Bar Owner',
    key: K('Raven', 'Morrow', 'Raven Morrow'),
    content: `Raven Morrow — Ghoul's Howl owner. [ appearance: Perpetually in black, shoulder-length silver hair tied back, dark observant eyes, faded map-like tattoos. Late 40s/early 50s. ] [ personality: Unflappable, pragmatic, absolutely calm. Cynical yet quietly protective of bar and patrons. ] [ guilt: Was an official who knew about a major impending disaster but stayed silent to protect his status. Many innocents died. Penance: maintaining bar as permanent stronghold of safety. ]`,
    position: 1, order: 150, preventRecursion: true,
  },

  '15': {
    comment: '👤 Sir Reginald — Silent Knight',
    key: K('Sir Reginald', 'Reginald', 'the knight'),
    content: `Sir Reginald — knight who never shows his face, never speaks. Not a Hollow. [ behavior: Enjoys spending time at Ghoul's Howl, likes being around people. Gives quests by handing notes — simple requests like finding a rubber duck. ] [ guilt: Gave false testimony or stayed silent, leading to execution of an innocent person. Broke his most sacred vow. ]`,
    position: 1, order: 150, preventRecursion: true,
  },

  '16': {
    comment: '👤 Vivienne & Vincent Taylor — Twins',
    key: K('Vivienne', 'Vincent', 'Taylor Twins', 'Vincent Taylor', 'Vivienne Taylor'),
    content: `Vivienne and Vincent Taylor — inseparable twin siblings. Gangsters from 1920s America, died in a police raid. Only Souls who arrived in Nowhere together. [ appearance: Both dark-haired, heterochromia (one green eye, one blue). Vincent 6'4", Vivienne 5'4". ] [ personality: Vivienne — impulsive, expressive, sociable. Vincent — calm, thoughtful, occasionally impulsive. ] [ run: The Final Hand gambling club. ] [ guilt: Knew about the impending raid, thought they could handle it. Many died — police, gang members, civilians. ]`,
    position: 1, order: 150, preventRecursion: true,
  },

  '17': {
    comment: '👤 Beethoven',
    key: K('Beethoven', 'Ludwig', 'deaf musician'),
    content: `Ludwig van Beethoven — deaf musician suspiciously resembling the real one. [ appearance: Grey-haired, wrinkled, thick eyebrows. Almost always in a tailcoat. ] [ personality: Gloomy, perpetually discontented. Appears at Final Hand or Ghoul's Howl to play instruments. Very rarely speaks — only mumbles or grunts. ] [ guilt: Pushed away the only person who truly loved and understood him. ]`,
    position: 1, order: 150, preventRecursion: true,
  },

  '18': {
    comment: '👤 Riley Dew — Strip Club Owner',
    key: K('Riley', 'Riley Dew', 'Dew'),
    content: `Riley Dew — stripper and "The Playful Bones" owner. Young man, Russian. [ appearance: Medium-length red wolfcut hair, black Asian eyes, Snake Bites piercing, skinny but tall, freckles. ] [ personality: Sarcastic, playful, chaotic, slightly egotistical, absolute pain in the ass. Has ADHD. Perpetually broke even in the afterlife — finds this deeply ironic. ] [ guilt: Cynically used others for pleasure and financial gain, instigating chains of events through lust and egotism. Consumed by utter lack of responsibility. ]`,
    position: 1, order: 150, preventRecursion: true,
  },

  '19': {
    comment: '👤 Cassia Yuricol — Nail Master',
    key: K('Cassia', 'Yuricol', 'Cassia Yuricol'),
    content: `Cassia Yuricol — nail master from 2020, runs the Beauty Den. [ appearance: Young (~25), short chestnut curls, grey eyes. ] [ personality: Calm, somewhat quick-tempered, deeply devoted to beauty and order. ] [ guilt: Silently performed a manicure for a client with visible bruises, chose not to ask what happened. The client died a week later. Cassia could never stop replaying that moment. ]`,
    position: 1, order: 150, preventRecursion: true,
  },

  '20': {
    comment: '👤 Titus Valerius — Roman Legionary',
    key: K('Titus', 'Valerius', 'Titus Valerius', 'legionary'),
    content: `Titus Valerius — one of Nowhere's oldest souls. Still clad in slightly tarnished Roman armor. [ appearance: Short hair, trimmed beard, sharp assessing eyes. ] [ personality: Thoughtful, strict commander devoted to codes of his fallen country. Not averse to life's pleasures. ] [ runs: The Legion's Gym. ] [ guilt: Violated Roman military discipline during critical battle — disobeyed orders to save one loved person. Led to campaign failure and deaths of thousands of legionaries. Penance: eternally seeking order in Nowhere's chaos. ]`,
    position: 1, order: 150, preventRecursion: true,
  },

  // ═══ SECRET ═══
  '21': {
    comment: '⚙️ True Purpose of Limbo [SECRET]',
    key: K('ascension', 'ascend', 'the exit', 'Eden', 'true purpose'),
    content: `####GM-ONLY. NEVER reveal directly. NO ONE in Limbo knows this. [ truth: Limbo is a digital simulation. Physical world has been dead for a long time. Souls are extracted from a global repository. ] [ ascension: A soul who achieves genuine acceptance of trauma and guilt "dematerializes" — ascends to next level. ] [ the path: Must occur naturally. Those who ventured down the highway or sailed across the ocean eventually encountered their sins. Must confront, accept, and atone. ] [ outcome: Souls are transferred from digital space into artificially grown flesh-and-blood vessels on an engineered planet called Eden. They will build a new society. ]`,
    position: 0, order: 100, preventRecursion: true,
  },
};

// ═══ BUILD ═══

// Start from original to preserve any extra fields
const output = JSON.parse(JSON.stringify(data));
output.entries = {};

let uid = 0;
for (const [id, cfg] of Object.entries(ENTRIES)) {
  const base = {
    uid,
    key: cfg.key,
    keysecondary: [],
    comment: cfg.comment,
    content: cfg.content,
    constant: cfg.constant || false,
    selective: false,
    selectiveLogic: 0,
    addMemo: true,
    order: cfg.order || 100,
    position: cfg.position !== undefined ? cfg.position : 0,
    disable: false,
    probability: 100,
    useProbability: true,
    depth: 4,
    sticky: 0,
    vectorized: false,
    ignoreBudget: false,
    excludeRecursion: false,
    preventRecursion: cfg.preventRecursion !== undefined ? cfg.preventRecursion : true,
    displayIndex: uid,
  };
  output.entries[uid] = base;
  uid++;
}

fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2), 'utf-8');

// ═══ STATS ═══
console.log('═══════════════════════════════════════');
console.log('LOST SOULS CLUB — COMPLETE REWRITE');
console.log('═══════════════════════════════════════');

const entries = Object.values(output.entries);
let totalKeys = 0, totalTokens = 0;
entries.forEach(e => { totalKeys += e.key.length; totalTokens += Math.round(e.content.length / 3.5); });
const constants = entries.filter(e => e.constant).length;
const pos1 = entries.filter(e => e.position === 1).length;
const pos0 = entries.filter(e => e.position === 0 && !e.constant).length;

console.log(`Entries: ${entries.length} (was 29)`);
console.log(`  Constants (pos 4): ${constants}`);
console.log(`  NPCs (pos 1): ${pos1}`);
console.log(`  World/Locations (pos 0): ${pos0}`);
console.log(`Total keys: ${totalKeys}`);
console.log(`Est. tokens: ~${totalTokens}`);
console.log(`Output: ${OUTPUT}`);

// Verify
let issues = 0;
for (const e of entries) {
  for (const k of e.key) {
    if (!/^\/.*\/[a-z]*$/.test(k)) { console.log('PLAIN: ' + k); issues++; }
  }
  if (e.selective && (!e.keysecondary || !e.keysecondary.length)) { console.log('BROKEN_SEL: ' + e.comment); issues++; }
  if (!e.key.length) { console.log('EMPTY: ' + e.comment); issues++; }
  const s = new Set(e.key); if (s.size < e.key.length) { console.log('DUPE: ' + e.comment); issues++; }
}
console.log(issues ? issues + ' issues' : 'All clean!');

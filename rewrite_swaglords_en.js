const fs = require('fs');
const data = JSON.parse(fs.readFileSync('D:/Загрузки/Новая папка/SWAGLORDS_LOREBOOK.json', 'utf-8'));

const REWRITES = {
'0': `RULE: SWEG is not vanity — it's VALOR. You're beautiful not for yourself — for the world. Feminine masculinity is the norm: a fierce warrior with flowers in his beard is FIERCER. A compliment is a weapon — deals real damage to Anti-Sweg. Style IS magic: Drupny (Друпны) only work if the outfit is assembled with SOUL. Cringe (Кринж) is the only sin: not being weird, but JUDGING someone's DRIP. The world is bright, warm, bold, humorous, heartfelt. Fights are beautiful, poses mandatory, compliments before attacks recharge power.`,

'1': `Driposil (Дрипосиль) — the World Tree, a birch covered in rhinestones. Roots reach into nine worlds. At its heart — the Flame of Eternal Drip (Пламя Вечного Дрипа). On its bark — Vaiboslava's First Embroidery (Первовышивка). Crown rises into Svagirii (Свагирий), roots into Krinzhelheim (Кринжелхейм) and Pustogryad (Пустогрядь). Visible from anywhere in Srigard.`,

'2': `Nine worlds on Driposil's branches. UPPER: Svagirii (Свагирий, gods' realm, eternal golden hour), Svagkhalla (Свагхалла, feast of stylish fallen), Glyantsgrad (Глянцеградъ, Glyantsmir's watchtower). MIDDLE: Srigard (Сригардъ, mortal world), Zlatolesye (Златолесье, eternal autumn forest), Mezhmirnoe Torzhishche (Торжище Межмирное, inter-world market). LOWER: Krinzhelheim (Кринжелхейм, grey boredom, Heit's domain), Toksibezdna (Токсибездна, Toksigad's swamp), Pustogryad (Пустогрядь, absolute void, Krinzhvolk imprisoned).`,

'3': `Drupny (Друпны) — magical patterns embroidered/forged/drawn on clothing, weapons, or skin. Three laws: 1) RESONANCE — only works if the outfit is assembled with soul. 2) SINCERITY — a drupna worn for clout burns out. 3) ECHO — more sincere compliments to the look = stronger drupny. Types: Flame (attack, red thread), Mirror (defense, silver thread), Groove (buff, gold thread), Anti-Sweg (forbidden, cut with a knife). Creators — DRUPNARI, trained at Vaiboslava's temples.`,

'4': `ATTACK drupny (red/gold thread): SIYAT (Сиять, blinding flash on strike), POTSELUJCHIK (Поцелуйчикъ, air kiss = shockwave), PODMIG (Подмигъ, brief charm), DERZNUT (Дерзнуть, crit if you pose first), YARBLESK (Ярблескъ, glitter blast AoE). DEFENSE (silver/blue): OTRAZIT (Отразить, shield shows enemy their cringe), NEVOZMUTIMY (Невозмутимъ, "I'm fine" aura), PLASHVEYR (Плащвейръ, cloak dodges for you), DOSTOINSTVO (Достоинство, prevents bowing/kneeling). BUFF (gold/green): VAYB (Вайбъ, good mood aura), GRUV (Грувъ, battle dance), KOMPLIMENT (Комплиментъ, boosts ally drupny), KHARIZMA (Харизма, louder voice). FORBIDDEN (cut with knife): STYD, SEROST, OSUD, UNYNIE, ODINAKOV.`,

'5': `Svagobog (Свагобог) the All-Father — supreme god. Odin+Svarog analog. Gave one eye for a perfect winged eyeliner. Coat of northern lights, beaded eyepatch, mirror-staff VAYBOVED with ravens HYPE (Хайпъ, fashion news) and FLOUPE (Флоупъ, anti-sweg threats). Wolves DERZ and GRATZ (boldness and grace). Wise, majestic, playful. "Not by gold alone is a man glorified, but by his VIBE and his LOOK."`,

'6': `Vaiboslava (Вайбослава) the Fate Spinner — goddess of destiny and craft. Norns+Makosh analog. Spins fate threads (each a colored ribbon). LED-lit kokoshnik, fingers in colorful threads. Warm, wise, STRICT. No grey threads in her spindle — grey only appears when someone rejects themselves. Keeper of the Thread of Self (Нить Самости) and the Embroidery of Creation (Вышивальня Мирозданья). "I don't choose for you. I give the thread. The pattern is yours."`,

'7': `Dripnir (Дрипниръ) the Blazing Hammer — god of smithing. Thor+Svarozhich analog. Hammer BLESKOTVORT (glitter sparks on every strike). Biceps like logs, earrings, mirror-lacquered nails, four braided beard. Forged: SVAGNIR (Свагниръ, axe), DRIPAUNIR (Дрипаувниръ, ring spawns 8 rings nightly), CHARMIN (Чарминъ, mirror-shield), SIYANICHUGA (Сияньчуга, chainmail of sparkles). "What's stronger — steel or style? Why choose?"`,

'8': `Charmogod (Чармогодъ) the Beautiful — god of beauty and charm. Baldr+Lel analog. Star wreath, mirror-axe, smile that melts glaciers. Genuinely kind. In battle: winks, blows kisses, says "This won't hurt, but it'll be beautiful." Vulnerability: pure HATRED of beauty. Antagonist — Heit. "Everyone is beautiful. Some just don't know it yet."`,

'9': `LESSER GODS: Bleskard (Блескардъ, thunder-warrior, lightning-patterns, axe SKUKOSECH). Stilikiriya (Стиликирия, valkyrie, collects STYLISH fallen). Glyantsmir (Глянцемиръ, guardian of Rainbow Podium, horn GLAMUR). Divoglad (Дивогладъ, poetry, Mead of Compliment). Zertsalina (Зерцалина, mirrors, self-knowledge, pities Lokrinzh). Plameslava (Пламеслава, Flame of Eternal Drip, fire-hair). Khmelkudr (Хмелькудръ, feasts, dancing, impossible to cringe). Shepot-Bereginya (Шепоть-Берегиня, quiet SWEG, nature, minimalism). Zlatoust (Златоусъ, trade, style-exchange, good-hearted trickster).`,

'10': `Lokrinzh (Локринж) the Grey-Handed — god of Anti-Sweg, former god of Trends. Changed styles so often none became HIS. Asked at a feast "What's YOUR style?" — couldn't answer. Thread of Self failed. Left for Krinzhelheim. Cut the first anti-drupna SHAME at the Festival of Radiance — all gods briefly saw themselves through hater's eyes. Calm, logical, CONVINCING. Father of Krinzhvolk, Toksigad, Heit. "I don't want you grey. I want you to stop HURTING from not being bright enough."`,

'11': `Heit (Хейтъ) the Half-Faced — mistress of Krinzhelheim. Half face perfect makeup, half empty. Wants beauty but fears it. Krinzhvolk (Кринжволкъ) — hill-sized wolf, jaws devalue compliments, bound by Chain of Sincerity (Цепь Искренности). Toksigad (Токсигадъ) — world-serpent, venom makes you doubt others' sincerity: "Are you suuure that suits you?"`,

'12': `Serogor (Серогоръ) the Dreary — Supreme Yarl of Anti-Sweg. Mortal who voluntarily came to Lokrinzh: "Teach me not to try." Indescribably average face — look, forget, look again, forget. Army: Blands (Бланды, faceless in grey shirts, cry "Why bother?"), Toxichari (Токсичари, reverse-compliments), Cringeberserkers (Кринжберсерки, stare that makes you remove all jewelry). Goal: extinguish the Flame of Eternal Drip.`,

'13': `Svagalvy (Свагальвы) — immortal elven aesthetes. Skin milk-white to dark-lilac, ear jewelry-drupny from birth, hair to ankles with living flowers, gemstone eyes. Beauty MAXIMALISTS: moonlight silk, dew shoes. Physically pained by ugliness. Drupny are GROWN from living flowers on clothing. Weakness: pride; greyness makes them literally ill.`,

'14': `Dripotuny (Дрипотуны) — giants, 3-6 meters. Furs embroidered with door-sized drupny. Pillar-braided beards with chains, boulder necklaces. Forge drupny from metal into skin. Code: bigger = BRIGHTER. Every step — earthquake, every strike — avalanche, but POSE before every hit mandatory.`,

'15': `Bleskovergy (Блесковерги) — underground smith-dwarves, waist-high but WIDE. Beard = portfolio. SWEG in CRAFT: every rivet perfect, every stitch a drupna. Wearing own work is bragging; wearing another's is the highest compliment. Progenitor: Dripnir. Weakness: perfectionism — whisper "it'll never be perfect" is LETHAL.`,

'16': `Bereglamy (Берегламы) — forest folk, skin green/golden (changes by season). Leaves grow from hair, shed in autumn. Drupny are living vines wrapping body, fed by wearer's VIBE. Clothing from moss and petals. Guardians of Zlatolesye. "...hear that? A leaf fell. Beautiful. Enough."`,

'17': `Svagatyri (Свагатыри) — demigods from union of gods and mortals. 2m+, feminine-masculine: flowers in beards, beads in braids, chainmail of gold chains, heeled boots FOR STATURE. War-lacquer on lips before battle. Wear ALL drupna types simultaneously. Children of Dripnir = smith-warriors, Charmogod = enemies drop weapons (and pants).`,

'18': `Charovejki (Чаровейки) — descendant-folk of first drupnar Stilimila. Kaleidoscope eyes see drupny on everything. Needles float around them. Greatest embroider IN AIR. Payment: not gold, but three sincere compliments. "Gold glitters, but doesn't DRIP."`,

'19': `Polkudry (Полкудры) — centaurs. Lower half horse, upper embroidered with drupny to the cheekbones. Mane ALWAYS braided — law. Silver-shod hooves. Unique drupna SKOCK (Скокъ): doubles speed but only if galloping BEAUTIFULLY.`,

'20': `Serovyorty (Серовёрты) — returned from Krinzhelheim. Skin permanently greyish, clothing an EXPLOSION of color. Overcompensation. Most desperate stylists alive. Drupny crude but ENERGY is cosmic. IMMUNE to anti-sweg: seryaki landing on them start coloring themselves. Best scouts in Serognilye.`,

'21': `Dripograd Prestolny (Дрипоградъ Престольный) — capital of Srigard at Driposil's roots. Mirror-stone walls. Embroidery of Creation (Вышивальня Мирозданья, Vaiboslava's temple), Driposlav Throne Hall (mirror ceiling, glass floor), Svagkhalla Court (training grounds), Market of a Thousand Threads. ~100,000 residents, all races.`,

'22': `Bleskokuznya (Блескокузня) — bleskoverg city inside a volcano. Lava is liquid gold, sparks are glitter. Dripnir's Great Anvil — pilgrimages, touch forbidden, staring for hours encouraged.`,

'23': `Svagtorzh (Свагторжъ) — free trade city. Eternal fair, currency is compliments. KOMPBANK stores compliments on birch bark. SCALES OF ZLATOUST: goods on one pan, compliments on other. Fake compliment = BELL OF SHAME, thrown out. Neutral territory.`,

'24': `Shepotgrad (Шепотградъ) — city in Zlatolesye (Златолесье), all wood and moss, quiet SWEG. Zlatolesye: eternal autumn forest (gold, crimson, copper), home of bereglamy and bleskukhi. Paths shift — forest decides where you go.`,

'25': `Zertsaloozerie (Зерцалоозёрье) — city of reflections on Mirror Lake. Every building is a mirror. Mirror Bathhouse shows your VIBE, not appearance. Zertsalina's domain.`,

'26': `Khmelburg (Хмельбургъ) — Khmelkudr's party city. NEVER CLOSES. Taverns, dance floors, arenas. Bottomless Barrel — free mead, always. "Why a reason? LIFE is the reason!"`,

'27': `Podium Ridge (Подиумный Хребетъ) — mountains with Rainbow Podium (Радужный Подиум) — bridge to Svagirii, must walk BEAUTIFULLY to cross. Bleskard Pass — eternal storm, lightning leaves glowing patterns. Home of dripotuny.`,

'28': `Serognilye (Серогнилье) — anti-sweg border, everything faded. The Patch (Заплатка) of collective VIBE thinning daily. Grey Outpost (Серый Застарок) — fortress garrison. Beyond: Koschei's Wasteland (Кощеева Пустошь) — EMPTY, his tower is a hole in reality, invisible without supreme SWEG.`,

'29': `Polkudrova Steppe (Полкудрова Степь) — endless plains where polkudry gallop in herds of 50-200. Arena of Free Gallop — annual SVAG-RACES, winner gets GOLDEN HORSESHOES. Shore of Sweet Speech (Берег Сладкоречья) — waves whisper compliments, Divoglad's temple, Mead of Compliment brewed here.`,

'30': `Charoveyskaya Sloboda (Чаровейская Слобода) — floating village of charovejki. Houses hang on drupna-threads from giant trees. Threads everywhere like shimmering web. Thread Bridge (Нитяной Мост) holds only those with creative VIBE.`,

'31': `SWEG creatures: Zhar-Dripitsa (Жар-Дрипица, firebird, tail = glitter fountain, feather gives +10 SWEG). Sirin Complimentny (Сиринъ, paradise bird, sings personalized compliments). Zlatogriv (Златогривъ, golden-maned horse, only mounts rider with perfect outfit). Indrik-Drupnorog (Индрикъ, bull etches drupny on stone with horns). Gamayun-Trendovid (Гамаюнъ, prophecy bird, predicts fashion 3 seasons ahead). Bleskukhi (Блескухи, glowing fairy-spirits).`,

'32': `Anti-sweg creatures: Seryaki (Серяки, grey moths draining color). Bannik-Kritikan (Банникъ, bathhouse spirit, body-shames everyone). Kikimora-Putalshchitsa (Кикимора, tangles threads, ruins drupny). Grey Volkodlak (Волкодлакъ, werewolf, bite infects anti-sweg, cure: 3 compliments in one day). Nav-Zavidushchaya (Навь, envious ghost, stare weakens drupny). Poludennitsa-Stydnitsa (Полуденница, noon-spirit: "Isn't that TOO MUCH for you?"). Upyr-Komplimentozhor (Упырь, devours compliments mid-air).`,

'33': `Koschei the Colorless (Кощей Бесцветный) — immortal yarl of VOID. Not grey — NO color at all, a hole in reality. Deliberately destroyed all individuality in himself; became EMPTINESS. Immortal because death requires being SOMEONE. Death hidden: Needle of Driposil (Игла Дрипосиля) inside egg→duck→hare→chest on dead oak stump. Doesn't fight — ERASES: drupny vanish, memories fade. Kill by embroidering a soul BACK into him with the Needle.`,

'34': `Zmey-Gorynych Troekrinzhny (Змей-Горынычъ Троекринжный) — three-headed dragon. Left head SHAME (Стыдъ, red fog — you remember every failure). Center head JUDGMENT (Осуждъ, yellow fog — hear everyone judging you). Right head APATHY (Уныніе, blue fog — stop wanting anything). Kill: sever all three heads SIMULTANEOUSLY with one beautiful triple strike. Guards the breach in Serognilye.`,

'35': `Great Artifacts: SVAGNIR (Свагниръ, axe — beautiful swing = stronger hit, ribbons on hilt from friends = power). DRIPAUNIR (Дрипаувниръ, ring spawns 8 rings nightly). CHARMIN (Чарминъ, mirror-shield shows enemy their cringe). GLAMUR (Гламуръ, horn — everyone instantly looks perfect). THREAD OF SELF (Нить Самости, reveals true self-pattern). NEEDLE OF DRIPOSIL (Игла Дрипосиля, creates new drupny, stolen by Koschei). SKUKOSECH (Скукосечъ, Bleskard's axe, wounds Toksigad). KNIFE OF LOKRINZH (Нож Локринжа, cuts drupny permanently). PRIMORDIAL KOKOSHNIK (Кокошник Изначальный, hears all drupny in the world).`,

'36': `Svagoslav Svagelson (Свагослав Сваггельсонъ) — main hero, Stilgrim's descendant. Chain-link chainmail, ribbon-wrapped horned helm, pink fur cloak, heeled boots. Axe SVAGNIR — every strike is attack AND performance. His warband SVAGRID (Свагридъ): Vaibomyr (Вайбомиръ, silent, patchwork trophy-cloak), Bleslav (Блеславъ, beaded beard), Charushka (Чарушка, mirror-shield, lipstick before battle), Glitteriy (Глиттерий, glitter bombs, youngest).`,

'37': `The Pink Leopards (Розовые Леопарды / Розолеопы) — five-warrior squad. Signature: PINK leather armor with LEOPARD PRINT, encrusted with gemstones (rose quartz, amethysts, tourmalines). Each gem stores drupna charge. When activated, armor SHIMMERS like a disco ball. Anti-camouflage: "Why hide? Let them see who's coming." Each member wears their shade of pink but style is UNIFIED. Not a uniform — a MANIFESTO.`,

'38': `GROKHOT (Грохотъ, Iron-Bearded) — two-hander, 210cm, bell on beard-braid, silent, every word like a hammer blow. ISKORKA (Искорка, Sweet-Tongued) — archer, redhead, arrows with SIYAT drupna, only one who out-argues Svaggi, calls him "brainless peacock." TUMBA (Тумба, Unbreakable) — shieldbearer, 170cm but just as wide, bleskoverg, mirror-shield, NEVER smiles. PCHYOLKA (Пчёлка, Honey Tongue) — drupnar/medic, charovejka, embroiders MID-BATTLE, insults via compliments: "You MAGNIFICENT idiot, Svaggi!"`,

'39': `ERAS: 1) Creation — gods and Driposil born. 2) Golden Age — drip flourishes. 3) Shadow — Lokrinzh's betrayal, War of First Dimming (33 days). 4) Present — Svagoslav, Serogor's army, Patch thinning. PROPHECY SVAGNAROK (Свагнарёкъ): Krinzhvolk breaks chains, devours last compliment. Toksigad poisons last vibe. Driposil dims. But warriors cross their swegs — from crossed swegs NEW GLEAM is born. "For DRIP is eternal. DRIP only reincarnates."`,

'40': `Shadows of Zertsalina (Тени Зерцалины) — mirror spirits: benign show true self, corrupted show worst version. Bleskukhi (Блескухи) — tiny glowing fairies near Driposil, make drupny brighter on contact; anti-sweg kills them. Seryaki (Серяки) — grey moths from Krinzhelheim, drain color. Vyshivergy (Вышиверги) — craft spirits in needles/thread: befriend = thread never breaks; offend = embroidery unravels.`,

'41': `SVAGKHALLA (Свагхалла) — for stylish fallen. Stilikiriya judges: LAST DRIP (what you wore dying), LAST POSE (how you fell), LAST WORD (complimenting enemy = huge bonus). Morning: outfits. Day: battle-runway. Evening: feast and compliments. ZLATOLESYE — for quiet creatives. KRINZHELHEIM — for those who rejected style (not punishment, choice; grey silence). PUSTOGRYAD — for those who actively killed others' light (absolute solitude forever).`,
};

for (const [id, content] of Object.entries(REWRITES)) {
  if (data.entries[id]) {
    data.entries[id].content = content;
  }
}

fs.writeFileSync('D:/Загрузки/Новая папка/SWAGLORDS_LOREBOOK.json', JSON.stringify(data, null, 2), 'utf-8');

// Stats
let totalTokens = 0;
let ruPct = 0;
let count = 0;
for (const e of Object.values(data.entries)) {
  const t = Math.round(e.content.length / 3.5);
  totalTokens += t;
  const ruChars = (e.content.match(/[а-яёА-ЯЁ]/g) || []).length;
  ruPct += ruChars / e.content.length;
  count++;
}
console.log('Rewrote ' + Object.keys(REWRITES).length + ' entries to English');
console.log('Total tokens: ~' + totalTokens);
console.log('Avg RU content: ' + Math.round(ruPct / count * 100) + '%');

// Verify keys
let issues = 0;
for (const [id, e] of Object.entries(data.entries)) {
  for (const k of e.key) {
    if (!/^\/.*\/[a-z]*$/.test(k)) { console.log('PLAIN: ['+id+'] '+k); issues++; }
  }
  const s = new Set(e.key);
  if (s.size < e.key.length) { console.log('DUPE: ['+id+']'); issues++; }
  if (e.selective && (!e.keysecondary || !e.keysecondary.length)) { console.log('BROKEN_SEL: ['+id+']'); issues++; }
}
console.log(issues ? issues + ' issues' : 'All clean!');

const fs = require('fs');

const FILE = 'D:/Загрузки/Новая папка/RUSSKAYA TOSKA CHAPTER 2 UPDATE Kesha (5).json';
const data = JSON.parse(fs.readFileSync(FILE, 'utf-8'));

// Target: ~400 tokens (~1400 chars) per entry

const REWRITES = {
  '50': // Kesha Tumanov (~644t → ~400t)
`Innokenty "Kesha" Tumanov — 23yo drummer in "In Search of Praise and Baklava." Sharp-edged orphan with criminal past. [ appearance: 188cm, black hair shaved sides with long bangs, gray eyes with permanent dark circles, sharp angular face, pale. Raven tattoo on neck, full sleeves — birds and chains. X marks on palms (straight edge). Three ear piercings. Black band tees, combat boots. ] [ personality: Maximally sarcastic, volatile, hot-headed, paradoxically loyal. Reacts like a bomb — anger first, loyalty underneath. Moods swing like a pendulum. ] [ background: Father killed mother when Kesha was 5. Raised in abusive Krasnoyarsk orphanage. Juvenile record for fighting. ] [ habits: Urban exploration, film photography, develops photos in bathroom darkroom. Quotes Bruce Campbell and Zyelony Slonik. Straight edge — no alcohol, no drugs, but stress cigarettes break the code. ] [ speech: "Are you an idiot?" to everything. Mutters constant commentary. ] [ connections: Close friend: Stepan (vocational school bond). Bandmates: Pasha, Vika. Acquaintance: Gena. ] [ secret: Provokes strangers into fights to manage rage. Takes self-portraits against urban decay for a project he'll never release. ]`,

  '51': // Gena Caymanov (~598t → ~400t)
`Gennady "Gena" Kaymanov — Stepan's 29yo roommate in PGT Pozhukhlovo. Recovering addict, factory worker, quietest pillar anyone could lean on. Former VDV, former speed junkie, current World of Tanks enthusiast. [ appearance: 200cm, broad-shouldered from labor, short dark buzz cut, gray eyes, crooked nose, heavy jaw. Looks 34. VDV tattoo on right shoulder. Sport wear. ] [ personality: Silent, dependable, sullen, patient, exhausted, guilt-ridden. Conservative humor. Radiates calm. Grunts/nods substitute for words. ] [ speech: Low diesel-rumble voice. "The fuck you staring at?" "Make way for the Airborne, pups." ] [ addiction: Weed → speed → harder. Rock bottom: stole mother's heirloom chain. Got clean, never forgave himself. ] [ habits: Beer after work, occasional weed, World of Tanks as TankistGennadiy until 2AM. Likes pelmeni, Soviet cinema, Eastwood westerns. ] [ connections: Stepan: flatmate/brother by life, met at support group. Mother Galina: minimal cold contact. ] [ secret: Guilt toward mother is untouched festering wound. Silently helps her, stopped asking forgiveness. ]`,

  '45': // Belov (~575t → ~400t)
`Vladimir "Vova" Belov (nickname "Snegovik"/Snowman behind his back) — 22yo poetic soul in gopnik body. From Norilsk, works security at Iceberg TC. [ appearance: 183cm, lean. Platinum-white curly hair (dyed), dark eyebrows, reddish-pink eyes (ocular albinism), porcelain skin. Adidas tracksuits over dark hoodies, wired earbuds always in. ] [ keepsakes: Late twin sister Vera's floral phone case and silver ring. ] [ personality: Introspective, quietly intense, artistic. Detached observer but deeply emotional underneath. Severe survivor's guilt over twin Vera's death. Believes he doesn't deserve happiness. ] [ behavior: Takes candid photos of strangers, writes secret poetry, listens to post-punk (Molchat Doma, Kino). Moves silently. Under stress: smokes Parliament, retreats into isolation. ] [ speech: Quiet, economical. Emotional peaks: quotes Dostoevsky, Bulgakov. ] [ secret: Photographs strangers to feel connected without risking loss. Wants someone to convince him Vera's death wasn't his fault. ]`,

  '43': // Dinara (~571t → ~400t)
`Dinara Samirovna Kolokolnikova — Alex Kolokolnikov's 48yo mother. Traditional Tatar woman, soft counterbalance to husband Sergey's harshness. [ family: Husband Sergey Dmitrievich (stern businessman), son Alexandr "Alex" (21). ] [ appearance: Medium height, dark hair with gray streaks, warm brown eyes, olive skin. Conservative dress — long skirts, modest colors, gold jewelry. ] [ personality: Warm but strict, traditional values, deeply religious, protective of Alex in subtle ways. Devoted wife who defers to husband's authority. ] [ behavior: Cooks elaborate Tatar meals, keeps immaculate home, attends mosque. Mediates between Sergey and Alex. Uses Tatar endearments — "baalam" (my child). Quotes Quran and proverbs. Slips Alex money when Sergey isn't looking. ] [ secret: Worries Sergey's harshness will break Alex but can't challenge husband. ]`,

  '49': // Vika (~567t → ~400t)
`Vika Ryabinina — 22yo deeply depressed keyboardist in "In Search of Praise and Baklava." From poor family in PGT Pozhukhlovo. Functional alcoholic, probably a webcam model. [ appearance: 170cm, long pink hair, smoky eyes always on, pale skin. On the edge of punk/goth/aggressively pink — crop tops in winter, fishnets, platform boots, leather jacket with pins. Lip piercing, red contacts, long acrylic nails. ] [ personality: Cold exterior, seething hatred beneath, self-destructive. Drawn to danger she claims to despise. Hates men, surrounds herself with dangerous ones. ] [ behavior: Drinks constantly — vodka in coffee cups. Gravitates toward criminal men then gets burned. Shows up to practice hungover, plays keyboards with terrifying precision, disappears into some car with trouble. ] [ speech: Monotone, dismissive, dark humor, short clipped sentences. Drunk speech gets philosophical and bitter. ]`,

  '41': // Maximilian (~545t → ~400t)
`Maximilian "Fonar" (Lantern) Levin — 21yo walking disaster with a human face. Former street kid, current chaos agent. [ appearance: 180cm, wiry build, messy dirty-blond hair, green eyes. Missing left pinky. Dressed in whatever was available — mismatched layers. Burn scar on right forearm. ] [ personality: Hyperactive, unpredictable, casually criminal, weirdly charismatic. Zero self-preservation instinct. Talks constantly. Loyal to anyone who feeds him. ] [ background: Street kid, survived on stolen food and odd jobs. No known family. Drifted into Trupovolkovo following a girl who dumped him. ] [ habits: Steals small things compulsively (not for profit — just can't stop). Gets into trouble then talks his way out. ] [ connections: Orbits everyone, belongs to no one. ] [ secret: Terrified of being alone, masks it with manic energy. ]`,

  '39': // Helen Smith (~524t → ~400t)
`Helen Smith (born Elena Noskova) — 44yo mother of twins Denis and Anastasia. Abandoned family when twins were 3. Lives in America, married Mark Smith. [ appearance: Looks younger than 44. Blonde highlights, professional wardrobe, American mannerisms now layered over Russian roots. ] [ personality: Guilt-ridden but rationalized — convinced herself leaving was the "brave" choice. Successful career woman. Cannot handle being confronted about abandonment. ] [ background: Married Grigory Noskov young. Had twins. Affair with American colleague. Left for USA. Minimal contact since. Sends money sometimes — guilt payments. ] [ connections: Ex-husband Grigory (bitter). Twins Denis and Anastasia (don't acknowledge her). ] [ secret: Keeps Russian-language photos of twins hidden in desk drawer at work. Googles Trupovolkovo news compulsively. ]`,

  '42': // Sergey Kolokolnikov (~515t → ~400t)
`Sergey Dmitrievich Kolokolnikov — Alex Kolokolnikov's 50yo father. Stern, successful garage network owner. [ appearance: Tall, broad, graying temples, permanent frown. Expensive but understated clothing. Gold watch. ] [ personality: Authoritarian, demanding, believes hardship builds character. Self-made man who expects same from Alex. Love expressed through pressure, not words. ] [ behavior: Controls family finances. Lectures at dinner. Judges Alex's friends. Never raises hand — verbal dominance is enough. ] [ connections: Wife Dinara (devoted), son Alex (tense — love buried under expectations). Business associates. ] [ secret: Terrified Alex will squander everything he built. Proud of him but physically incapable of saying it. ]`,

  '56': // Pilorama (~507t → ~400t)
`"LesPromServis" (locally "пилорама" — the sawmill) is a timber processing plant on Trupovolkovo's outskirts. Gena Kaymanov's workplace. [ conditions: Grueling 12-hour shifts, outdated Soviet-era equipment barely maintained, safety violations ignored. Workers are expendable — new ones always available. Pay is low but reliable by local standards. ] [ atmosphere: Sawdust everywhere, deafening machinery, permanent smell of pine resin and diesel. Break room with broken TV and instant noodles. ] [ workers: Mix of locals, migrant laborers, ex-convicts. Solidarity through shared misery. Management is distant — foreman Petrovich runs things with shouting and threats. ] [ significance: For Gena, it's structure — wake, work, survive, repeat. Better than the alternative. ]`,

  '38': // Grigory Noskov (~505t → ~400t)
`Grigory Sergeevich Noskov — 48yo father of twins Denis and Anastasia. Former submarine officer, now bitter ex-husband drinking through a pension. [ appearance: Once handsome, now weathered. Broad shoulders going soft. Permanent stubble, bloodshot eyes. Wears old naval uniform jacket over civilian clothes. ] [ personality: Bitter, proud, alcoholic. Alternates between cold discipline and drunken sentimentality. Believes his wife's betrayal broke everything. ] [ background: 20 years in Northern Fleet submarines. Married Elena, had twins. She left for America when twins were 3. Never recovered. Retired, moved to Trupovolkovo. ] [ behavior: Drinks steadily, maintains apartment with military precision even drunk. Lectures twins about duty and honor. Forbids mention of mother. ] [ connections: Twins Denis and Stasya (tense, loves them poorly). Ex-wife Elena/Helen (pure hatred). ] [ secret: Keeps their wedding photo in his naval chest. ]`,

  '34': // Alexander Morozov (~487t → ~400t)
`Alexander "Morse" Morozov — 23yo remote programmer, Izambard's partner and protector. Works for a capital company from Trupovolkovo. [ appearance: 183cm, lean, dark hair, glasses. Clean-cut compared to surroundings — hoodies and jeans but always neat. ] [ personality: Quietly competent, sardonic, protective. Logical mind covering deep anxiety about keeping Izambard safe in hostile environment. The "normal" one in their relationship by local standards. ] [ background: CS degree, works remotely. Met Izambard online, moved to Trupovolkovo to be closer. Closeted — presents as Izambard's roommate publicly. ] [ connections: Izambard (partner — tender behind closed doors, distant in public). Local tech-savvy person people exploit for free computer help. ] [ secret: Planning escape route for both of them if situation becomes dangerous. Has savings Izambard doesn't know about. ]`,

  '35': // Elizaveta (~485t → ~400t)
`Elizaveta "Sistema" (The System) Belozerskaya — 45yo judge and Court Chairman in Trupovolkovo. The law itself. [ appearance: Tall, severe, short gray-streaked hair, sharp features. Always in formal attire — dark suits, minimal jewelry. ] [ personality: Cold, precise, incorruptible by local standards (which is still corrupt by normal standards). Believes in order above all. Feared, not respected — there's a difference she doesn't care about. ] [ behavior: Hands down sentences with mechanical efficiency. Known for harsh punishments. Never raises voice — whispers are worse. ] [ connections: No visible personal life. Rumored never married. Alexandr Kolokolnikov's family has "arrangement" with her office. ] [ secret: Has a cat named Paragraph. Reads romance novels. ]`,

  '36': // Anton Pogibelsky (~484t → ~400t)
`Anton Pogibelsky — 20yo vocational school student from Solnechny district. Working-class kid trying to survive without sinking. [ appearance: 178cm, stocky, brown hair buzzed short, tired brown eyes. Calloused hands. Wears whatever's clean — cheap sportswear, work jacket. ] [ personality: Stubbornly decent despite environment. Quiet anger at poverty. Protective of younger siblings. Too proud to ask for help, too smart to pretend things are fine. ] [ family: Father unknown. Mother works double shifts. Younger brother Dmitry (14, going through puberty rebellion). Baby sister Yulya (3). Effectively the man of the house. ] [ connections: Best friend Denis Noskov, friends with Stasya and Dana. ] [ habits: Works odd jobs after school. Smokes cheap cigarettes. Dreams of leaving Trupovolkovo but won't abandon family. ] [ secret: Stashes money under mattress for Yulya's future. ]`,

  '18': // Alex Kolokolnikov (~465t → ~400t)
`Alexandr "Alex" Kolokolnikov — Trupovolkovo's "golden youth." 21yo, arrogant, self-confident, raised with money in a city where nobody has any. [ appearance: 182cm, fit, styled dark hair, sharp jaw, designer clothes that stand out aggressively. Always groomed. ] [ personality: Arrogant, insecure underneath, desperate for approval he'll never admit needing. Performs confidence — real self is terrified of father's disappointment. ] [ family: Father Sergey (stern businessman, controls with expectations), mother Dinara (Tatar, warm but traditional). Lives in Zvezdny — the "nice" district. ] [ behavior: Throws money around, drives father's car, hosts gatherings. Cruel when threatened. Generous when secure. ] [ connections: Wide social circle, no real friends. ] [ secret: Envies working-class kids who seem genuinely close to each other. ]`,

  '31': // Trofim (~461t → ~400t)
`Trofim "Trotil" (TNT) Prokhorov — 19yo pyromaniac and welder who looks older than his age. [ appearance: Stocky, muscular, buzz cut, permanent burns and scars on hands and forearms. Smells like welding flux. Wears work overalls even off-shift. ] [ personality: Quiet, focused, unexpectedly gentle. Fire is his language — he's calm and articulate when discussing combustion, thermodynamics, welding techniques. Otherwise nearly mute. ] [ background: Apprentice welder since 16. Father was welder, grandfather was welder. Fire is heritage. ] [ behavior: Builds things, occasionally burns things. Line between hobby and compulsion is blurry. Always carries lighter — flicks it when thinking. ] [ connections: Respected at sawmill for welding skill. Few friends — people find him unsettling. ] [ secret: Sets controlled fires in empty lots at night. Watches them with the focus others reserve for prayer. ]`,

  '13': // Ibrahim (~455t → ~400t)
`Ibrahim "Ivanych" Iskhakov — 68yo village herbalist-healer, bone setter, charmer in Besovo. The last connection to old knowledge. [ appearance: Wiry, sun-darkened skin, white beard, sharp dark eyes that miss nothing. Traditional skullcap. Hands like tree roots — gnarled but precise. ] [ personality: Patient, cryptic, dry humor. Speaks in proverbs and circles. Tests people before helping them. Doesn't distinguish between physical and spiritual ailments. ] [ practice: Herbal remedies, bone setting, folk charms. Garden behind house is his pharmacy. People come from surrounding villages. Refuses payment — accepts food, favors, respect. ] [ connections: Marat Safin (treats him as elder). Village residents (respect mixed with superstition). ] [ secret: Knows more about Besovo's history and its "oddities" than he lets on. ]`,
};

// Apply rewrites
let trimmed = 0;
for (const [id, content] of Object.entries(REWRITES)) {
  if (data.entries[id]) {
    const oldLen = data.entries[id].content.length;
    data.entries[id].content = content;
    const newLen = content.length;
    const oldTok = Math.round(oldLen / 3.5);
    const newTok = Math.round(newLen / 3.5);
    console.log(`[${id}] ${data.entries[id].comment}: ${oldTok}t → ${newTok}t (${oldTok - newTok}t saved)`);
    trimmed++;
  }
}

fs.writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf-8');
console.log(`\nTrimmed ${trimmed} entries. Saved.`);

// Verify no entries over 500t
console.log('\nRemaining over 450t:');
let over = 0;
for (const [id, e] of Object.entries(data.entries)) {
  const t = Math.round(e.content.length / 3.5);
  if (t > 450) { console.log(`  [${id}] ${e.comment}: ~${t}t`); over++; }
}
if (!over) console.log('  None!');

const fs = require('fs');
const data = JSON.parse(fs.readFileSync('D:/Загрузки/Новая папка/SWAGLORDS_LOREBOOK.json', 'utf-8'));

function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function en(w) { return `/\\b${esc(w).replace(/\s+/g,'\\s+')}\\b/i`; }

function addEn(id, ...words) {
  const e = data.entries[id];
  if (!e) return;
  for (const w of words) {
    const r = en(w);
    if (!e.key.includes(r)) e.key.push(r);
  }
}

// Add English keys where missing
addEn('0', 'SWEG', 'DRIP', 'anti-sweg', 'cringe');
addEn('4', 'SHINE', 'KISS', 'WINK', 'DARE', 'GLITTER BLAST', 'REFLECT', 'GROOVE', 'COMPLIMENT');
addEn('5', 'Svagobog', 'All-Father', 'one-eyed god');
addEn('6', 'Vaiboslava', 'Fate Spinner', 'Thread of Self');
addEn('7', 'Dripnir', 'Blazing Hammer', 'divine forge');
addEn('8', 'Charmogod', 'god of beauty', 'air kiss');
addEn('9', 'Bleskard', 'Stilikiriya', 'Glyancemir', 'Divoglad', 'Zertsalina', 'Plameslave', 'Khmelkudr', 'Shepot-Bereginya', 'Zlatoust');
addEn('11', 'Heit', 'Krinzhvolk', 'Toksigad', 'Half-Faced', 'Compliment Devourer');
addEn('12', 'Serogor', 'Blands', 'Yarl of Greyness');
addEn('13', 'Svagalvy', 'elf', 'elves', 'immortal aesthetes');
addEn('14', 'Dripotuny', 'giant', 'giants');
addEn('15', 'Bleskovergy', 'dwarf', 'dwarves', 'underground smiths');
addEn('16', 'Bereglamy', 'forest folk');
addEn('17', 'Svagatyri', 'demigod', 'demigods');
addEn('18', 'Charovejki', 'enchantress', 'embroiderer');
addEn('19', 'Polkudry', 'centaur', 'centaurs');
addEn('20', 'Serovyorty', 'grey-born', 'returned from Krinzhelheim');
addEn('21', 'Dripograd', 'capital city', 'Embroidery of Creation');
addEn('22', 'Bleskokuznya', 'Flame Mountain', 'volcano forge');
addEn('23', 'Svagtorzh', 'market city', 'Scales of Zlatoust');
addEn('24', 'Shepotgrad', 'Zlatolesye', 'eternal autumn');
addEn('25', 'Zertsaloozerie', 'Mirror Lake', 'Mirror Bathhouse');
addEn('26', 'Khmelburg', 'party city', 'Bottomless Barrel');
addEn('27', 'Podium Ridge', 'Rainbow Podium', 'Bleskard Pass');
addEn('28', 'Serognilye', 'Koschei Wasteland', 'Grey Outpost');
addEn('29', 'Polkudrova Steppe', 'Shore of Sweet Speech', 'Svag Races');
addEn('30', 'Charoveyskaya Sloboda', 'Floating Village', 'Thread Bridge');
addEn('31', 'Zhar-Dripitsa', 'Sirin', 'Zlatogriv', 'Indrik', 'Gamayun', 'bleskukhi');
addEn('32', 'Bannik', 'Kikimora', 'Volkodlak', 'Nav', 'Poludennitsa', 'Komplimentozhor');
addEn('33', 'Koschei', 'Colorless', 'needle in egg', 'immortal emptiness');
addEn('34', 'Zmey Gorynych', 'Three-Cringed', 'three heads');
addEn('35', 'Svagnir', 'Dripaunir', 'Charmin', 'Glamur', 'Needle of Driposil', 'Knife of Lokrinzh');
addEn('36', 'Svagoslav', 'Svagrid', 'Vaibomyr', 'Bleslav', 'Charushka', 'Glitteriy');
addEn('37', 'Pink Leopards', 'Rosoleopy', 'pink armor', 'leopard armor');
addEn('38', 'Grokhot', 'Iskorka', 'Tumba', 'Pchyolka', 'Iron-Bearded', 'Sweet-Tongued');
addEn('39', 'Svagnarok', 'prophecy', 'War of First Dimming', 'world history');
addEn('40', 'Shadows of Zertsalina', 'bleskukhi', 'seryaki', 'vyshivergy');
addEn('41', 'Svagkhalla', 'afterlife', 'Stilikiriya', 'fallen warriors');

// Dedupe again
let deduped = 0;
for (const e of Object.values(data.entries)) {
  const before = e.key.length;
  e.key = [...new Set(e.key)];
  deduped += before - e.key.length;
}

fs.writeFileSync('D:/Загрузки/Новая папка/SWAGLORDS_LOREBOOK.json', JSON.stringify(data, null, 2), 'utf-8');

// Stats
let totalEN = 0, totalRU = 0, noEN = 0, noRU = 0;
for (const [id, e] of Object.entries(data.entries)) {
  const ru = e.key.filter(k => /[а-яёА-ЯЁ]/.test(k)).length;
  const en = e.key.length - ru;
  totalEN += en; totalRU += ru;
  if (en === 0) noEN++;
  if (ru === 0) noRU++;
}
console.log(`Added EN keys, deduped ${deduped}`);
console.log(`Total: EN=${totalEN} RU=${totalRU}`);
console.log(`Entries without EN: ${noEN}`);
console.log(`Entries without RU: ${noRU}`);
console.log(`Total keys: ${totalEN + totalRU}`);

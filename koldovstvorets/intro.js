/* =====================================================================
   КОЛДОВСТВОРЕЦ – интро «письмо», эмбиент, свечи
   Самодостаточный модуль: строит свой DOM, ничего в странице не трогает,
   кроме классов на <html> (ki-pending / ki-lit) и localStorage:
     kold-intro-seen = 1   – интро уже показывали
     kold-muted      = 1   – звук выключен
   ===================================================================== */
(function () {
  'use strict';

  var SEEN_KEY = 'kold-intro-seen', MUTE_KEY = 'kold-muted';
  var AUDIO_SRC = 'koldovstvorets/audio/ambient.mp3', MAX_VOL = 0.2;   // громкость: не больше 20%
  var html = document.documentElement;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function lang() { return html.getAttribute('data-lang') || lsGet('rt-lang') || 'ru'; }
  function ru(r, e) { return '<span class="lang-ru">' + r + '</span><span class="lang-en">' + e + '</span>'; }
  function syncLang(root) {
    var l = lang();
    root.querySelectorAll('.lang-ru').forEach(function (n) { n.style.display = l === 'ru' ? '' : 'none'; });
    root.querySelectorAll('.lang-en').forEach(function (n) { n.style.display = l === 'en' ? '' : 'none'; });
  }
  var SVG = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs) { var e = document.createElementNS(SVG, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }

  /* ---------------------------------------------------------------
     SVG: общие defs – бумага, чернила, сургуч, гравюра, перфорация
     --------------------------------------------------------------- */
  function defs() {
    var perf = '';
    for (var x = 0; x <= 78; x += 6) perf += '<circle cx="' + x + '" cy="0" r="2.4"/><circle cx="' + x + '" cy="96" r="2.4"/>';
    for (var y = 6; y < 96; y += 6) perf += '<circle cx="0" cy="' + y + '" r="2.4"/><circle cx="78" cy="' + y + '" r="2.4"/>';
    return '<svg class="ki-defs" width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' +
      // бумага: волокно через освещение шума + мелкое зерно
      '<filter id="ki-paper" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">' +
        '<feTurbulence type="fractalNoise" baseFrequency=".06 .09" numOctaves="4" seed="3" result="fib"/>' +
        '<feDiffuseLighting in="fib" lighting-color="#fffaf0" surfaceScale=".55" diffuseConstant="1" result="lit"><feDistantLight azimuth="40" elevation="58"/></feDiffuseLighting>' +
        '<feComposite in="lit" in2="SourceGraphic" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" result="shaded"/>' +
        '<feTurbulence type="fractalNoise" baseFrequency=".95" numOctaves="2" seed="11" result="grain"/>' +
        '<feColorMatrix in="grain" values="0 0 0 0 .35  0 0 0 0 .25  0 0 0 0 .12  0 0 0 .07 0" result="grainA"/>' +
        '<feBlend in="shaded" in2="grainA" mode="multiply"/>' +
      '</filter>' +
      // пятна и затёртости
      '<filter id="ki-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>' +
      '<filter id="ki-soft2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.6"/></filter>' +
      // чернила: лёгкое растекание и неровный край пера
      '<filter id="ki-ink" x="-5%" y="-10%" width="110%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="1" seed="5" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.1" result="d"/><feGaussianBlur in="d" stdDeviation=".22" result="b"/><feComponentTransfer in="b"><feFuncA type="gamma" exponent=".8"/></feComponentTransfer></filter>' +
      // штемпель: неровный оттиск, местами не пропечатан
      '<filter id="ki-stamp" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".08" numOctaves="2" seed="9" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" result="d"/><feTurbulence type="fractalNoise" baseFrequency=".6" numOctaves="2" seed="4" result="g"/><feColorMatrix in="g" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.4 1.5" result="holes"/><feComposite in="d" in2="holes" operator="in"/></filter>' +
      // сургуч: блик и объём
      '<filter id="ki-wax" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">' +
        '<feGaussianBlur in="SourceAlpha" stdDeviation="2.4" result="blur"/>' +
        '<feSpecularLighting in="blur" surfaceScale="7" specularConstant=".55" specularExponent="34" lighting-color="#fff" result="spec"><fePointLight x="30" y="18" z="120"/></feSpecularLighting>' +
        '<feComposite in="spec" in2="SourceAlpha" operator="in" result="specIn"/>' +
        '<feComposite in="SourceGraphic" in2="specIn" operator="arithmetic" k1="0" k2="1" k3=".9" k4="0" result="lit"/>' +
        '<feDropShadow in="lit" dx="0" dy="2.2" stdDeviation="1.8" flood-color="#000" flood-opacity=".5"/>' +
      '</filter>' +
      '<filter id="ki-shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx=".6" dy="1" stdDeviation=".8" flood-color="#000" flood-opacity=".35"/></filter>' +
      // гравюра: тонкая штриховка для марок
      '<pattern id="ki-hatch" width="2.2" height="2.2" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 0 H2.2" stroke="#000" stroke-width=".55" stroke-opacity=".55"/></pattern>' +
      '<pattern id="ki-hatch2" width="2.6" height="2.6" patternUnits="userSpaceOnUse" patternTransform="rotate(-50)"><path d="M0 0 H2.6" stroke="#000" stroke-width=".5" stroke-opacity=".35"/></pattern>' +
      '<mask id="ki-perf" maskUnits="userSpaceOnUse" x="-3" y="-3" width="84" height="102"><rect x="0" y="0" width="78" height="96" fill="#fff"/><g fill="#000">' + perf + '</g></mask>' +
      // градиенты
      '<linearGradient id="ki-envFront" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#efe3c6"/><stop offset=".55" stop-color="#e8d9b8"/><stop offset="1" stop-color="#dac9a3"/></linearGradient>' +
      '<linearGradient id="ki-envBack" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d9c8a3"/><stop offset="1" stop-color="#c7b48b"/></linearGradient>' +
      '<linearGradient id="ki-flapGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ecdfc1"/><stop offset=".7" stop-color="#dbc9a3"/><stop offset="1" stop-color="#c9b58c"/></linearGradient>' +
      '<linearGradient id="ki-pockL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e9dcbc"/><stop offset="1" stop-color="#d4c29b"/></linearGradient>' +
      '<linearGradient id="ki-pockR" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#e9dcbc"/><stop offset="1" stop-color="#d4c29b"/></linearGradient>' +
      '<linearGradient id="ki-pockB" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ecdfc1"/><stop offset="1" stop-color="#d6c49d"/></linearGradient>' +
      '<radialGradient id="ki-sealGrad" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#2a9a6a"/><stop offset=".5" stop-color="#136b4a"/><stop offset="1" stop-color="#083825"/></radialGradient>' +
      '<radialGradient id="ki-crestGrad" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#2fb87f"/><stop offset="1" stop-color="#0b4f37"/></radialGradient>' +
      '<radialGradient id="ki-glowGrad"><stop offset="0" stop-color="#ffd97a" stop-opacity=".9"/><stop offset=".45" stop-color="#d9b24a" stop-opacity=".35"/><stop offset="1" stop-color="#d9b24a" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="ki-flameGrad" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff8a2a"/><stop offset=".45" stop-color="#ffc24d"/><stop offset="1" stop-color="#fff2b0"/></linearGradient>' +
      '<linearGradient id="ki-waxGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#cdbf9f"/><stop offset=".35" stop-color="#f1e6c8"/><stop offset="1" stop-color="#b8a98a"/></linearGradient>' +
      '<path id="ki-arcTop" d="M-36 0 A36 36 0 1 1 36 0"/><path id="ki-arcBot" d="M36 0 A36 36 0 0 1 -36 0"/>' +
      '</defs></svg>';
  }

  /* ---------------------------------------------------------------
     SVG: герб – жар-птица в кольце (viewBox 0 0 100 100)
     Птица рисуется в координатах 200×200 и масштабируется в 100×100.
     Перо – лист вдоль изогнутого «стержня» (квадратичная кривая B→T через C),
     ширина w. Между перьями тонкий просвет цветом фона, чтобы они читались.
     --------------------------------------------------------------- */
  var crestN = 0;
  function feather(b, t, c, w) {
    var dx = t[0] - b[0], dy = t[1] - b[1], L = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / L * w, ny = dx / L * w;
    return 'M' + b[0] + ' ' + b[1] + ' Q' + (c[0] + nx).toFixed(1) + ' ' + (c[1] + ny).toFixed(1) + ' ' + t[0] + ' ' + t[1] +
           ' Q' + (c[0] - nx).toFixed(1) + ' ' + (c[1] - ny).toFixed(1) + ' ' + b[0] + ' ' + b[1] + 'Z';
  }
  function qpt(b, c, t, k) { var u = 1 - k; return [u * u * b[0] + 2 * u * k * c[0] + k * k * t[0], u * u * b[1] + 2 * u * k * c[1] + k * k * t[1]]; }
  function firebird(fg, sep) {
    // крыло – цельный силуэт с зубчатым краем, перья обозначены просветами
    var wing = 'M94 86 C78 62 52 44 24 34 Q36 48 18 56 Q36 68 20 78 Q40 86 30 98 Q46 104 46 116 C60 118 80 116 96 110 Z';
    var wingLines = [[[28, 46], [88, 86]], [[27, 67], [88, 90]], [[31, 88], [90, 96]], [[40, 106], [92, 102]]];
    var coverts = 'M94 86 C84 74 70 66 56 62 Q66 76 60 88 Q74 92 72 104 Q84 108 96 108 Z';
    var covLines = [[[60, 76], [90, 92]], [[66, 95], [92, 100]]];
    // хвост – пять языков пламени
    var tail = 'M90 124 Q70 150 54 178 Q72 170 76 192 Q90 176 100 198 Q110 176 124 192 Q128 170 146 178 Q130 150 110 124 Z';
    var tailLines = [[[100, 130], [66, 178]], [[100, 130], [86, 188]], [[100, 130], [114, 188]], [[100, 130], [134, 178]]];
    var tips = [[54, 178], [76, 192], [100, 198], [124, 192], [146, 178]];
    var g = '<g fill="' + fg + '" stroke="' + fg + '" stroke-width=".8" stroke-linejoin="round">';
    g += '<path d="' + wing + '"/><path d="' + wing + '" transform="translate(200 0) scale(-1 1)"/>';
    g += '<path d="' + tail + '"/>';
    g += '<path d="' + coverts + '"/><path d="' + coverts + '" transform="translate(200 0) scale(-1 1)"/>';
    // тело, голова, клюв, хохол
    g += '<path d="M100 64 C90 68 86 86 88 104 C90 120 96 128 100 130 C104 128 110 120 112 104 C114 86 110 68 100 64 Z"/>';
    g += '<circle cx="100" cy="56" r="8.5"/>';
    g += '<path d="M106.5 52 L121 56.5 L106.5 61 Z"/>';
    g += '<path d="' + feather([98, 49], [82, 26], [91, 36], 3) + '"/><path d="' + feather([100, 48], [98, 20], [100, 33], 3) + '"/><path d="' + feather([102, 49], [116, 28], [107, 37], 3) + '"/>';
    g += '</g>';
    // просветы между перьями, глаз и «глазки» – цветом фона
    var L = '<g fill="none" stroke="' + sep + '" stroke-width="1.7" stroke-linecap="round">';
    wingLines.concat(covLines).forEach(function (l) {
      L += '<path d="M' + l[0][0] + ' ' + l[0][1] + ' L' + l[1][0] + ' ' + l[1][1] + '"/>';
      L += '<path d="M' + (200 - l[0][0]) + ' ' + l[0][1] + ' L' + (200 - l[1][0]) + ' ' + l[1][1] + '"/>';
    });
    tailLines.forEach(function (l) { L += '<path d="M' + l[0][0] + ' ' + l[0][1] + ' Q' + ((l[0][0] + l[1][0]) / 2 + (l[1][0] < 100 ? 6 : -6)) + ' ' + ((l[0][1] + l[1][1]) / 2) + ' ' + l[1][0] + ' ' + l[1][1] + '"/>'; });
    L += '<path d="M94 86 C78 62 52 44 24 34" stroke-width="1.2"/><path d="M106 86 C122 62 148 44 176 34" stroke-width="1.2"/>';
    L += '</g>';
    L += '<g fill="' + sep + '"><circle cx="102.8" cy="55" r="1.7"/>';
    tips.forEach(function (t) { var cx = 100 + (t[0] - 100) * .84, cy = 130 + (t[1] - 130) * .84; L += '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="2.4"/>'; });
    L += '</g>';
    return g + L;
  }
  function crest(o) {
    o = o || {};
    var id = 'kc' + (++crestN);
    var solid = !!o.solid;
    var ring = o.ring || '#8fe3b5', bird = solid ? (o.fg || '#ecdfc0') : (o.bird || '#d9b24a');
    var txt = solid ? (o.fg || '#ecdfc0') : (o.text || ring);
    var sep = solid ? (o.sep || (ring.indexOf('url(') === 0 ? '#0b4f37' : ring)) : (o.sep || o.bg && o.bg !== 'none' && o.bg.indexOf('url(') !== 0 ? o.bg : '#ecdfc0');
    if (!solid && o.sep) sep = o.sep;
    var s = '';
    if (solid) s += '<circle cx="50" cy="50" r="48" fill="' + ring + '"/>' + (o.rim ? '<circle cx="50" cy="50" r="48.6" fill="none" stroke="' + o.rim + '" stroke-width="1.4"/>' : '');
    else s += '<circle cx="50" cy="50" r="48" fill="' + (o.bg || 'none') + '" stroke="' + ring + '" stroke-width="1.6"/>';
    s += '<circle cx="50" cy="50" r="40.5" fill="none" stroke="' + txt + '" stroke-width=".7" opacity=".9"/>';
    // надпись по кольцу
    s += '<defs><path id="' + id + 't" d="M50 50 m-44.3 0 a44.3 44.3 0 1 1 88.6 0"/><path id="' + id + 'b" d="M5.7 50 a44.3 44.3 0 0 0 88.6 0"/></defs>';
    s += '<g font-family="PT Serif, serif" font-weight="700" font-size="5.6" letter-spacing="1.4" fill="' + txt + '">' +
      '<text><textPath href="#' + id + 't" startOffset="50%" text-anchor="middle">КОЛДОВСТВОРЕЦ</textPath></text>' +
      '<text font-size="4.6" letter-spacing="1.2"><textPath href="#' + id + 'b" startOffset="50%" text-anchor="middle">МЕДНАЯ ГОРА · УРАЛ</textPath></text></g>';
    s += '<g fill="' + txt + '"><path d="M5.7 50 l1.6 -2 1.6 2 -1.6 2z"/><path d="M91.1 50 l1.6 -2 1.6 2 -1.6 2z"/></g>';
    // птица
    s += '<g transform="translate(50 50) scale(.37) translate(-100 -110)">' + firebird(bird, sep) + '</g>';
    return s;
  }
  function crestSvg(o, cls) { return '<svg viewBox="0 0 100 100" class="' + (cls || '') + '" aria-hidden="true">' + crest(o) + '</svg>'; }

  /* ---------------------------------------------------------------
     SVG: конверт, лицевая сторона (viewBox 0 0 600 400)
     --------------------------------------------------------------- */
  function stains(seed) {
    // лёгкое старение: пятна от чая и пальцев
    var s = '<g filter="url(#ki-soft)" fill="#6b4a1e">';
    var spots = [[520, 330, 46, 18, .09], [90, 360, 30, 12, .07], [300, 40, 70, 10, .05], [560, 70, 22, 22, .06], [40, 120, 18, 40, .05]];
    for (var i = 0; i < spots.length; i++) { var p = spots[(i + seed) % spots.length]; s += '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="' + p[2] + '" ry="' + p[3] + '" opacity="' + p[4] + '"/>'; }
    return s + '</g>';
  }
  function paperRect(grad) {
    return '<rect width="600" height="400" rx="2" fill="' + grad + '" filter="url(#ki-paper)"/>' +
      '<rect x=".75" y=".75" width="598.5" height="398.5" rx="2" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1"/>' +
      '<rect x=".5" y=".5" width="599" height="399" rx="2" fill="none" stroke="#7a5f36" stroke-opacity=".5" stroke-width="1"/>';
  }
  function stampNII() {
    // НИИ Прикладной Магии: гравюра здания института, синяя
    return '<g filter="url(#ki-shadow)"><g mask="url(#ki-perf)">' +
      '<rect width="78" height="96" fill="#dfe6ee"/>' +
      '<rect x="4" y="4" width="70" height="88" fill="none" stroke="#2f4f7f" stroke-width="1"/>' +
      '<rect x="6" y="6" width="66" height="84" fill="none" stroke="#2f4f7f" stroke-width=".4"/>' +
      '<rect x="9" y="18" width="60" height="46" fill="#c8d6e6"/>' +
      '<rect x="9" y="18" width="60" height="46" fill="url(#ki-hatch2)"/>' +
      '<g fill="#2f4f7f">' +
        '<rect x="15" y="40" width="48" height="24"/><rect x="25" y="31" width="28" height="9"/><rect x="36" y="24" width="6" height="7"/>' +
        '<rect x="38.3" y="12" width="1.4" height="12"/><circle cx="39" cy="11" r="1.8"/>' +
      '</g>' +
      '<g fill="#dfe6ee"><rect x="19" y="44" width="4" height="6"/><rect x="27" y="44" width="4" height="6"/><rect x="35" y="44" width="4" height="6"/><rect x="43" y="44" width="4" height="6"/><rect x="51" y="44" width="4" height="6"/><rect x="19" y="54" width="4" height="6"/><rect x="27" y="54" width="4" height="6"/><rect x="43" y="54" width="4" height="6"/><rect x="51" y="54" width="4" height="6"/><rect x="29" y="33" width="3" height="4"/><rect x="36" y="33" width="3" height="4"/><rect x="43" y="33" width="3" height="4"/></g>' +
      '<rect x="15" y="40" width="48" height="24" fill="url(#ki-hatch)" opacity=".5"/>' +
      '<ellipse cx="39" cy="11" rx="10" ry="3.2" fill="none" stroke="#2f4f7f" stroke-width=".7" transform="rotate(-28 39 11)"/><ellipse cx="39" cy="11" rx="10" ry="3.2" fill="none" stroke="#2f4f7f" stroke-width=".7" transform="rotate(28 39 11)"/>' +
      '<g font-family="PT Serif, serif" fill="#2f4f7f" text-anchor="middle">' +
        '<text x="39" y="14.5" font-size="6" letter-spacing="1.6">РОССИЯ · 2000</text>' +
        '<text x="39" y="74" font-size="6.6" font-weight="700" letter-spacing=".5">НИИ ПРИКЛАДНОЙ</text><text x="39" y="81.5" font-size="6.6" font-weight="700" letter-spacing="1.5">МАГИИ</text>' +
        '<text x="11" y="89.5" font-size="7" font-weight="700" text-anchor="start">3</text><text x="67" y="89.5" font-size="5" text-anchor="end" letter-spacing=".5">ПОЧТА</text>' +
      '</g></g></g>';
  }
  function stampSoroka() {
    // Сорочья канцелярия: сорока на ветке, зелёная
    return '<g filter="url(#ki-shadow)"><g mask="url(#ki-perf)">' +
      '<rect width="78" height="96" fill="#e3e9dc"/>' +
      '<rect x="4" y="4" width="70" height="88" fill="none" stroke="#1f5a3f" stroke-width="1"/>' +
      '<rect x="6" y="6" width="66" height="84" fill="none" stroke="#1f5a3f" stroke-width=".4"/>' +
      '<rect x="9" y="18" width="60" height="46" fill="#cfdccb"/>' +
      '<rect x="9" y="18" width="60" height="46" fill="url(#ki-hatch2)"/>' +
      // ветка
      '<path d="M10 58 C24 52 40 54 68 44" fill="none" stroke="#3b2a17" stroke-width="1.8" stroke-linecap="round"/><path d="M30 54 c-2 -4 -1 -7 2 -9 M48 49 c1 -4 3 -6 6 -7" fill="none" stroke="#3b2a17" stroke-width="1" stroke-linecap="round"/>' +
      // сорока: тело, голова, хвост, белое брюхо
      '<g fill="#1a2a22">' +
        '<path d="M26 44 C28 36 36 31 44 33 C50 34 52 39 51 44 C50 49 44 52 38 51 C32 50 27 48 26 44Z"/>' +
        '<path d="M43 34 C44 29 49 27 53 29 C56 31 57 34 55 36 L59 37 L54 38 C52 40 48 40 46 38 C44 37 43 36 43 34Z"/>' +
        '<path d="M28 46 C20 48 12 52 8 60 C14 56 22 53 30 50 Z"/>' +
        '<path d="M34 50 l1 7 M40 51 l0 7" stroke="#1a2a22" stroke-width="1.2" stroke-linecap="round"/>' +
      '</g>' +
      '<path d="M31 45 C33 41 38 39 44 40 C47 42 47 47 43 49 C38 50 33 49 31 45Z" fill="#eef2ea"/>' +
      '<path d="M37 38 C40 35 45 35 48 36 C47 38 44 39 40 39 C38 39 37 39 37 38Z" fill="#9db2c9" opacity=".8"/>' +
      '<circle cx="51" cy="32.5" r="1" fill="#eef2ea"/><circle cx="51.3" cy="32.5" r=".5" fill="#1a2a22"/>' +
      '<rect x="9" y="18" width="60" height="46" fill="url(#ki-hatch)" opacity=".28"/>' +
      '<g font-family="PT Serif, serif" fill="#1f5a3f" text-anchor="middle">' +
        '<text x="39" y="14.5" font-size="6" letter-spacing="1.6">РОССИЯ · 2000</text>' +
        '<text x="39" y="74" font-size="6.4" font-weight="700" letter-spacing=".4">СОРОЧЬЯ</text><text x="39" y="81.5" font-size="6.4" font-weight="700" letter-spacing=".3">КАНЦЕЛЯРИЯ</text>' +
        '<text x="11" y="89.5" font-size="7" font-weight="700" text-anchor="start">5</text><text x="67" y="89.5" font-size="5" text-anchor="end" letter-spacing=".5">ПОЧТА</text>' +
      '</g></g></g>';
  }
  function postmark(x, y, rot) {
    var waves = '';
    for (var i = 0; i < 6; i++) { var yy = -25 + i * 10; waves += '<path d="M-150 ' + yy + ' q 8 -4.5 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0"/>'; }
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ')" filter="url(#ki-stamp)" fill="none" stroke="#2b2118" stroke-opacity=".78" stroke-width="1.5">' +
      '<circle r="41"/><circle r="40" stroke-width=".6"/><circle r="30" stroke-width="1"/>' +
      '<g stroke-width="1.3" stroke-linecap="round" stroke-opacity=".7">' + waves + '</g>' +
      '<g font-family="PT Serif, serif" font-weight="700" fill="#2b2118" fill-opacity=".8" stroke="none">' +
        '<text font-size="7.4" letter-spacing="1.4"><textPath href="#ki-arcTop" startOffset="50%" text-anchor="middle">МРАМОРСКОЕ · СВЕРДЛОВСКАЯ ОБЛ.</textPath></text>' +
        '<text font-size="6.4" letter-spacing="1.8"><textPath href="#ki-arcBot" startOffset="50%" text-anchor="middle">СОРОЧЬЯ КАНЦЕЛЯРИЯ</textPath></text>' +
        '<text y="-4" font-size="11" text-anchor="middle">01.09</text><text y="10" font-size="11" text-anchor="middle">2000</text><text y="22" font-size="6" text-anchor="middle" letter-spacing="2">УРАЛ</text>' +
      '</g></g>';
  }
  function envelopeFront() {
    var idx = '', digits = '6 2 0 0 0 0'.split(' ');
    for (var i = 0; i < 6; i++) idx += '<rect x="' + (36 + i * 19) + '" y="338" width="15" height="22" fill="none" stroke="#b7742f" stroke-opacity=".55" stroke-width="1"/>' +
      '<text x="' + (43.5 + i * 19) + '" y="355" font-family="Bad Script, cursive" font-size="17" fill="#1f3a2c" fill-opacity=".85" text-anchor="middle" filter="url(#ki-ink)">' + digits[i] + '</text>';
    return '<svg viewBox="0 0 600 400" aria-hidden="true">' +
      paperRect('url(#ki-envFront)') + stains(0) +
      // кромка под клапаном сзади чуть просвечивает: тонкие линии сгибов по краям
      '<path d="M0 0 L300 210 L600 0" fill="none" stroke="#000" stroke-opacity=".05" stroke-width="1"/>' +
      // отправитель
      '<g transform="translate(24 22) scale(.5)">' + crest({ solid: true, ring: '#1f3a2c', fg: '#e8d9b8' }) + '</g>' +
      '<g font-family="PT Serif, serif" fill="#1f3a2c" letter-spacing="2.2">' +
        '<text x="84" y="40" font-size="11.5" font-weight="700">ШКОЛА ЧАРОДЕЙСТВА «КОЛДОВСТВОРЕЦ»</text>' +
        '<text x="84" y="56" font-size="10" fill-opacity=".8">МЕДНАЯ ГОРА · УРАЛ · ПОЧТА ЧЕРЕЗ МРАМОРСКОЕ</text></g>' +
      // адрес
      '<g font-family="Bad Script, cursive" fill="#1f3a2c" fill-opacity=".92" font-size="26" filter="url(#ki-ink)">' +
        '<text x="150" y="228">Ученику (-це) {{user}}</text>' +
        '<text x="150" y="268">Комната под самой крышей</text>' +
        '<text x="150" y="308">Дом, который сам тебя найдёт</text>' +
        '<text x="150" y="348">г. Труповолково, Красноярский край</text>' +
      '</g>' +
      idx +
      // марки и штемпель
      '<g transform="translate(426 28) rotate(-3.5)">' + stampNII() + '</g>' +
      '<g transform="translate(512 36) rotate(4)">' + stampSoroka() + '</g>' +
      postmark(474, 118, -13) +
      '</svg>';
  }

  /* ---------------------------------------------------------------
     SVG: конверт, обратная сторона – тело, карманы, клапан, печать
     --------------------------------------------------------------- */
  function envelopeBody() {
    return '<svg class="ki-body" viewBox="0 0 600 400" aria-hidden="true">' + paperRect('url(#ki-envBack)') + '</svg>';
  }
  function envelopePockets() {
    return '<svg class="ki-pockets" viewBox="0 0 600 400" aria-hidden="true">' +
      // боковые и нижний карманы, каждый со своим светом
      '<g filter="url(#ki-paper)">' +
        '<path d="M0 0 L300 212 L0 400 Z" fill="url(#ki-pockL)"/>' +
        '<path d="M600 0 L300 212 L600 400 Z" fill="url(#ki-pockR)"/>' +
        '<path d="M0 400 L300 196 L600 400 Z" fill="url(#ki-pockB)"/>' +
      '</g>' +
      // тени под сгибами и световые рёбра
      '<path d="M0 400 L300 196 L600 400" fill="none" stroke="#000" stroke-opacity=".10" stroke-width="7" filter="url(#ki-soft2)"/>' +
      '<path d="M0 400 L300 196 L600 400" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1"/>' +
      '<path d="M0 0 L300 212 M600 0 L300 212" fill="none" stroke="#000" stroke-opacity=".08" stroke-width="4" filter="url(#ki-soft2)"/>' +
      stains(2) +
      '<path d="M.5 .5 V399.5 H599.5 V.5" fill="none" stroke="#7a5f36" stroke-opacity=".5" stroke-width="1"/>' +
      '</svg>';
  }
  function envelopeFlap() {
    return '<svg class="ki-flap" viewBox="0 0 600 400" aria-hidden="true">' +
      '<path d="M0 0 L600 0 L300 228 Z" fill="url(#ki-flapGrad)" filter="url(#ki-paper)"/>' +
      '<path d="M0 0 L300 228 L600 0" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="5" filter="url(#ki-soft2)"/>' +
      '<path d="M0 0 L300 228 L600 0" fill="none" stroke="#7a5f36" stroke-opacity=".55" stroke-width="1"/>' +
      '<path d="M10 2 L300 222 L590 2" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1"/>' +
      '</svg>';
  }
  function seal() {
    // край сургуча: плавная кривая с неровностями + две капли
    var pts = [], n = 18;
    for (var i = 0; i < n; i++) { var a = i / n * Math.PI * 2, r = 40 + rnd(-2.2, 2.6); pts.push([50 + Math.cos(a) * r, 50 + Math.sin(a) * r]); }
    var d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
    for (var k = 0; k < n; k++) {
      var p0 = pts[k], p1 = pts[(k + 1) % n], mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2;
      d += ' Q' + p0[0].toFixed(1) + ' ' + p0[1].toFixed(1) + ' ' + mx.toFixed(1) + ' ' + my.toFixed(1);
    }
    d += ' Z';
    var em = function (dx, dy, col, op) { return '<g transform="translate(' + (20 + dx) + ' ' + (20 + dy) + ') scale(.6)" opacity="' + op + '">' + crest({ ring: col, bird: col, text: col, bg: 'none', sep: '#0f5c40' }) + '</g>'; };
    return '<svg class="ki-seal" viewBox="0 0 100 100" aria-hidden="true">' +
      '<g filter="url(#ki-wax)">' +
        '<path d="' + d + '" fill="url(#ki-sealGrad)"/>' +
        '<ellipse cx="86" cy="62" rx="5" ry="3.6" fill="url(#ki-sealGrad)" transform="rotate(25 86 62)"/>' +
        '<ellipse cx="18" cy="76" rx="3.4" ry="2.6" fill="url(#ki-sealGrad)"/>' +
      '</g>' +
      // тиснение герба: тень вниз-вправо, свет вверх-влево, сам рельеф чуть темнее сургуча
      '<circle cx="50" cy="50" r="31" fill="none" stroke="#062a1c" stroke-width="1.6" transform="translate(.8 .8)" opacity=".8"/>' +
      '<circle cx="50" cy="50" r="31" fill="none" stroke="#5fcf96" stroke-width="1" transform="translate(-.5 -.5)" opacity=".3"/>' +
      '<circle cx="50" cy="50" r="31" fill="none" stroke="#0e5a3e" stroke-width="1.4"/>' +
      em(.8, .8, '#062a1c', .7) + em(-.5, -.5, '#5fcf96', .28) + em(0, 0, '#0d5038', 1) +
      '<ellipse cx="34" cy="26" rx="13" ry="6" fill="#fff" opacity=".10" transform="rotate(-32 34 26)"/>' +
      '</svg>';
  }

  /* ---------------------------------------------------------------
     SVG: свеча (viewBox 0 0 60 H)
     --------------------------------------------------------------- */
  function candle(h) {
    var H = 60 + h + 10;
    return '<svg viewBox="0 0 60 ' + H + '" aria-hidden="true">' +
      '<circle class="ki-glow" cx="30" cy="30" r="30" fill="url(#ki-glowGrad)" style="--gl:' + rnd(1.2, 2.2).toFixed(2) + 's"/>' +
      '<g class="ki-flame" style="--fl:' + rnd(.7, 1.2).toFixed(2) + 's">' +
      '<path d="M30 50 C21 38 23 27 30 15 C37 27 39 38 30 50 Z" fill="url(#ki-flameGrad)"/>' +
      '<path d="M30 48 C26 41 27 35 30 29 C33 35 34 41 30 48 Z" fill="#fff6c9" opacity=".9"/>' +
      '</g>' +
      '<path d="M30 49 L30 56" stroke="#3a2a1a" stroke-width="1.6" stroke-linecap="round"/>' +
      '<rect x="18" y="56" width="24" height="' + h + '" rx="2.5" fill="url(#ki-waxGrad)"/>' +
      '<path d="M18 62 c-2.5 6 1.5 9 0 16 c3 -4 2 -11 0 -16z" fill="#f1e6c8"/>' +
      '<path d="M42 66 c2.5 5 -1 8 0 13 c-3 -4 -2 -9 0 -13z" fill="#f1e6c8"/>' +
      '<ellipse cx="30" cy="56" rx="12" ry="4" fill="#f5ebd0"/>' +
      '<ellipse cx="30" cy="54.5" rx="7" ry="2.2" fill="#e2d3ad"/>' +
      '<ellipse cx="30" cy="' + (56 + h) + '" rx="12" ry="3.5" fill="#000" opacity=".25"/>' +
      '</svg>';
  }
  function lightCandles() {
    if (document.querySelector('.ki-candles')) { html.classList.add('ki-lit'); return; }
    var wrap = el('div', 'ki-candles');
    var corners = [
      { x: 'left', y: 'top', ox: 26, oy: 96 }, { x: 'right', y: 'top', ox: 26, oy: 110 },
      { x: 'left', y: 'bottom', ox: 30, oy: 30 }, { x: 'right', y: 'bottom', ox: 76, oy: 40 }
    ];
    corners.forEach(function (c, ci) {
      var n = 3;
      for (var i = 0; i < n; i++) {
        var d = el('div', 'ki-candle', candle(Math.round(rnd(34, 82))));
        var w = Math.round(rnd(30, 46));
        d.style.setProperty('--cw', w + 'px');
        d.style.setProperty('--fd', rnd(4, 7).toFixed(2) + 's');
        d.style.setProperty('--fdl', (-rnd(0, 6)).toFixed(2) + 's');
        d.style[c.x] = (c.ox + i * 38 + rnd(-6, 6)) + 'px';
        d.style[c.y] = (c.oy + rnd(-18, 18) + (i % 2) * 22) + 'px';
        d.style.opacity = rnd(.75, 1).toFixed(2);
        wrap.appendChild(d);
      }
    });
    document.body.appendChild(wrap);
    requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('ki-lit'); }); });
  }

  /* ---------------------------------------------------------------
     Звук
     --------------------------------------------------------------- */
  var audio = null, fadeRaf = 0, armed = false;
  function ensureAudio() {
    if (audio) return audio;
    audio = new Audio(AUDIO_SRC);
    audio.loop = true; audio.preload = 'auto'; audio.volume = 0;
    audio.muted = lsGet(MUTE_KEY) === '1';
    return audio;
  }
  function fadeTo(target, ms) {
    cancelAnimationFrame(fadeRaf);
    var from = audio.volume, t0 = performance.now();
    (function step(t) {
      var k = Math.min(1, (t - t0) / ms);
      audio.volume = Math.max(0, Math.min(MAX_VOL, from + (target - from) * k));
      if (k < 1) fadeRaf = requestAnimationFrame(step);
    })(t0);
  }
  function startAudio() {
    ensureAudio();
    var p = audio.play();
    if (p && p.then) p.then(function () { fadeTo(MAX_VOL, 2500); updateDock(); }).catch(function () { armOnGesture(); });
    else { fadeTo(MAX_VOL, 2500); updateDock(); }
  }
  function armOnGesture() {
    if (armed) return; armed = true;
    var go = function () {
      window.removeEventListener('pointerdown', go, true); window.removeEventListener('keydown', go, true);
      armed = false; startAudio();
    };
    window.addEventListener('pointerdown', go, true); window.addEventListener('keydown', go, true);
  }
  function toggleMute() {
    ensureAudio();
    audio.muted = !audio.muted;
    lsSet(MUTE_KEY, audio.muted ? '1' : '0');
    if (!audio.muted && audio.paused) startAudio();
    updateDock();
  }

  /* ---------------------------------------------------------------
     Док: звук + переиграть
     --------------------------------------------------------------- */
  var dock, muteBtn, replayBtn;
  function buildDock() {
    dock = el('div', 'ki-dock');
    muteBtn = el('button', 'ki-mute');
    muteBtn.type = 'button';
    muteBtn.innerHTML = '<span class="ki-eq ki-on-ico"><i></i><i></i><i></i><i></i></span>' +
      '<svg class="ki-off-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4h4l5 4V6l-5 4H4z"/><path d="M17 8l5 8M22 8l-5 8"/></svg>';
    muteBtn.addEventListener('click', toggleMute);
    replayBtn = el('button', 'ki-replay');
    replayBtn.type = 'button'; replayBtn.hidden = true;
    replayBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="13" rx="1.5"/><path d="M3 7l9 6 9-6"/><path d="M12 13v-3" opacity="0"/></svg>';
    replayBtn.addEventListener('click', function () { openIntro(true); });
    dock.appendChild(replayBtn); dock.appendChild(muteBtn);
    document.body.appendChild(dock);
    updateDock();
  }
  function updateDock() {
    var m = audio ? audio.muted : lsGet(MUTE_KEY) === '1';
    muteBtn.classList.toggle('ki-off', m); muteBtn.classList.toggle('ki-on', !m);
    var l = lang();
    muteBtn.setAttribute('data-tip', m ? (l === 'ru' ? 'Включить звук' : 'Sound on') : (l === 'ru' ? 'Выключить звук · 20%' : 'Mute · 20%'));
    muteBtn.setAttribute('aria-label', muteBtn.getAttribute('data-tip'));
    replayBtn.setAttribute('data-tip', l === 'ru' ? 'Перечитать письмо' : 'Replay the letter');
    replayBtn.setAttribute('aria-label', replayBtn.getAttribute('data-tip'));
  }

  /* ---------------------------------------------------------------
     Искры
     --------------------------------------------------------------- */
  function sparkPath(s) { return 'M0 ' + (-s) + ' Q' + (s * .22) + ' ' + (-s * .22) + ' ' + s + ' 0 Q' + (s * .22) + ' ' + (s * .22) + ' 0 ' + s + ' Q' + (-s * .22) + ' ' + (s * .22) + ' ' + (-s) + ' 0 Q' + (-s * .22) + ' ' + (-s * .22) + ' 0 ' + (-s) + 'Z'; }
  function spark(layer, x, y, s, cls, color, vars) {
    var g = svgEl('g', { transform: 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')' });
    var p = svgEl('path', { d: sparkPath(s), fill: color, 'class': cls });
    for (var k in vars) p.style.setProperty(k, vars[k]);
    g.appendChild(p); layer.appendChild(g);
    return g;
  }
  function seedSparks(layer) {
    var W = window.innerWidth, H = window.innerHeight, n = Math.round(Math.min(40, W * H / 30000));
    for (var i = 0; i < n; i++) {
      spark(layer, rnd(0, W), rnd(0, H), rnd(2, 5.5), 'ki-spark', Math.random() < .7 ? '#d9b24a' : '#8fe3b5',
        { '--d': rnd(2.5, 6).toFixed(2) + 's', '--dl': (-rnd(0, 6)).toFixed(2) + 's', '--o': rnd(.25, .6).toFixed(2) });
    }
  }
  function burst(layer, x, y, n, rmin, rmax) {
    for (var i = 0; i < n; i++) {
      var a = rnd(0, Math.PI * 2), r = rnd(rmin, rmax);
      var g = spark(layer, x, y, rnd(4, 11), 'ki-burst', Math.random() < .5 ? '#d9b24a' : '#8fe3b5',
        { '--tx': (Math.cos(a) * r).toFixed(1) + 'px', '--ty': (Math.sin(a) * r).toFixed(1) + 'px' });
      setTimeout(function (g) { g.remove(); }, 1000, g);
    }
  }

  /* ---------------------------------------------------------------
     Текст письма
     --------------------------------------------------------------- */
  function sheetHtml() {
    var ink = { solid: true, ring: '#1f3a2c', fg: '#ecdfc0' };
    return '<div class="ki-head"><img class="ki-crest-img" src="koldovstvorets/images/logo/crest-firebird.webp" alt="">' +
      '<div><div class="ki-head-t">' + ru('КОЛДОВСТВОРЕЦ', 'KOLDOVSTORETZ') + '</div>' +
      '<div class="ki-head-s">' + ru('Школа чародейства в Медной горе', 'School of Witchcraft in the Copper Mountain') + '</div>' +
      '<div class="ki-head-d">' + ru('Медная гора · Урал · почта через Мраморское', 'Copper Mountain · Urals · post via Mramorskoye') + '</div></div></div>' +
      '<div class="ki-orn"></div>' +
      '<p class="ki-salut">' + ru('Уважаемый(-ая)', 'Dear') + ' <span class="ki-hand">{{user}}</span>,</p>' +
      '<p>' + ru('Рады сообщить, что Вы зачислены в Школу чародейства «Колдовстворец».', 'We are pleased to inform you that you have been accepted at Koldovstoretz School of Witchcraft.') + '</p>' +
      '<p>' + ru('Занятия начинаются 1 сентября 2000 года. Список необходимых книг и предметов прилагается.', 'Classes begin on 1 September 2000. Please find enclosed a list of all necessary books and equipment.') + '</p>' +
      '<p>' + ru('Учебный год начинается 1 сентября. Мы ожидаем вашу сороку не позднее 31 июля.', 'The school year begins on 1 September. We await your magpie no later than 31 July.') + '</p>' +
      '<div class="ki-sign"><div class="ki-hand">' + ru('Искренне ваша,', 'Yours sincerely,') + '</div>' +
      '<div class="ki-hand ki-sign-name">' + ru('Медянникова Марья Полозовна,', 'Marya Polozovna Medyannikova,') + '</div>' +
      '<div class="ki-sign-title">' + ru('Директор Колдовстворца и Медной горы Хозяйка.', 'Headmistress of Koldovstoretz and Mistress of the Copper Mountain.') + '</div>' +
      '<svg class="ki-stamp-ink" viewBox="0 0 100 100" aria-hidden="true"><g filter="url(#ki-stamp)" fill="none" stroke="#2c5f8a" stroke-width="1.4">' +
        '<circle cx="50" cy="50" r="46"/><circle cx="50" cy="50" r="45" stroke-width=".5"/><circle cx="50" cy="50" r="33"/>' +
        '<g transform="translate(50 50)"><text font-family="PT Serif, serif" font-size="7.2" font-weight="700" letter-spacing="1.6" fill="#2c5f8a" stroke="none"><textPath href="#ki-arcTop" startOffset="50%" text-anchor="middle">ШКОЛА ЧАРОДЕЙСТВА</textPath></text>' +
        '<text font-family="PT Serif, serif" font-size="7.2" font-weight="700" letter-spacing="1.6" fill="#2c5f8a" stroke="none"><textPath href="#ki-arcBot" startOffset="50%" text-anchor="middle">КОЛДОВСТВОРЕЦ · 1984</textPath></text></g>' +
        '<g transform="translate(26 26) scale(.48)" fill="#2c5f8a" stroke="none">' + crest({ ring: '#2c5f8a', bird: '#2c5f8a', text: '#2c5f8a', bg: 'none', sep: '#ecdfc0' }) + '</g>' +
      '</g></svg></div>';
  }

  /* ---------------------------------------------------------------
     Оверлей и последовательность
     --------------------------------------------------------------- */
  var overlay = null, timers = [], trailTimer = 0, obs = null;
  function clearTimers() { timers.forEach(clearTimeout); timers = []; clearInterval(trailTimer); trailTimer = 0; }
  function after(ms, fn) { timers.push(setTimeout(fn, ms)); }

  function openIntro(isReplay) {
    if (overlay) return;
    overlay = el('div', 'ki-overlay');
    overlay.innerHTML =
      '<svg class="ki-sparks" width="100%" height="100%" aria-hidden="true"></svg>' +
      '<div class="ki-stage"><div class="ki-flyer"><div class="ki-env">' +
      '<div class="ki-face ki-front">' + envelopeFront() + '</div>' +
      '<div class="ki-face ki-back">' + envelopeBody() +
      '<div class="ki-letter-sm"><img class="ki-lsm-crest" src="koldovstvorets/images/logo/crest-firebird.webp" alt="">' + '<div class="ki-lsm-t">' + ru('КОЛДОВСТВОРЕЦ', 'KOLDOVSTORETZ') + '</div><div class="ki-lsm-lines"><i></i><i></i><i style="width:70%"></i></div></div>' +
      envelopePockets() + '<div class="ki-flap-wrap">' + envelopeFlap() + '</div>' + seal() +
      '</div></div></div></div>' +
      '<div class="ki-idle">' + crestSvg({ solid: true, ring: 'url(#ki-crestGrad)', fg: '#d9b24a', rim: '#8fe3b5' }, 'ki-crest') +
      '<div class="ki-wordmark">КОЛДОВСТВОРЕЦ</div>' +
      '<button type="button" class="ki-btn ki-pulse ki-start">' + ru('Вскрыть письмо', 'Open the letter') + '</button>' +
      '<div class="ki-note">' + ru('со звуком · тихо, 20%', 'with sound · quiet, 20%') + '</div></div>' +
      '<div class="ki-film"><video muted loop playsinline preload="metadata" poster="koldovstvorets/video/intro-trailer.jpg" aria-label="Колдовстворец / Koldovstoretz"><source src="koldovstvorets/video/intro-trailer.mp4" type="video/mp4"></video></div>' +
      '<button type="button" class="ki-tap">' + ru('Нажми, чтобы продолжить', 'Click to continue') + '</button>' +
      '<div class="ki-sheet-wrap"><div class="ki-read"><div class="ki-sheet">' + sheetHtml() + '</div>' + '</div>' +
      '<button type="button" class="ki-btn ki-enter">' + ru('Войти в школу', 'Enter the school') + '</button></div>' +
      '<button type="button" class="ki-skip">' + ru('Пропустить', 'Skip') + '</button>';
    document.body.appendChild(overlay);
    syncLang(overlay);
    var sparks = overlay.querySelector('.ki-sparks');
    seedSparks(sparks);
    overlay.querySelector('.ki-start').addEventListener('click', function () { startAudio(); play(); });
    overlay.querySelector('.ki-skip').addEventListener('click', finish);
    overlay.querySelector('.ki-enter').addEventListener('click', finish);
    // сначала ролик на весь экран; по нажатию он гаснет и на тёмном фоне идёт письмо
    var film = overlay.querySelector('.ki-film'), fv = film && film.querySelector('video'), tap = overlay.querySelector('.ki-tap');
    if (film) {
      setStage('s-film');
      // ролик без звука играет всегда – даже если в системе выключены эффекты анимации (Windows: «Эффекты анимации»);
      // если браузер всё же не дал запустить (режим экономии), пробуем ещё раз, когда страница станет видимой
      if (fv) {
        var tryPlay = function () { var pr = fv.play(); if (pr && pr.catch) pr.catch(function () {}); };
        tryPlay(); fv.addEventListener('canplay', function () { if (fv.paused) tryPlay(); }, { once: true });
        document.addEventListener('visibilitychange', function () { if (!document.hidden && fv.paused && film.isConnected) tryPlay(); });
      }
      setTimeout(function () { if (tap && overlay) tap.focus({ preventScroll: true }); }, 1900);
      var go = function () {
        if (!overlay || !overlay.classList.contains('s-film')) return;
        startAudio();
        overlay.querySelector('.ki-idle').classList.add('ki-hide');
        overlay.style.background = 'radial-gradient(ellipse 70% 60% at 50% 45%, #0a1410, #000 75%)';
        setStage('');
        setTimeout(function () { if (fv) fv.pause(); film.remove(); if (tap) tap.remove(); if (overlay) play(); }, 900);
      };
      film.addEventListener('click', go);
      if (tap) tap.addEventListener('click', go);
    }
    if (replayBtn) replayBtn.hidden = true;
    // язык переключили во время интро
    obs = new MutationObserver(function () { syncLang(overlay); updateDock(); });
    obs.observe(html, { attributes: true, attributeFilter: ['data-lang'] });
  }

  function setStage(s) {
    overlay.className = 'ki-overlay ' + s;
  }
  function envCenter() {
    var r = overlay.querySelector('.ki-env').getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
  }
  function play() {
    overlay.querySelector('.ki-idle').classList.add('ki-hide');
    var sparks = overlay.querySelector('.ki-sparks');
    if (reduced) { setStage('s-read'); return; }
    setStage('s-fly');   /* полёт 3.4с */
    // шлейф за письмом
    trailTimer = setInterval(function () {
      var c = envCenter();
      for (var i = 0; i < 1; i++) {
        var g = spark(sparks, c.x + rnd(-c.w * .4, c.w * .4), c.y + rnd(-c.h * .4, c.h * .4), rnd(2.5, 6), 'ki-trail',
          Math.random() < .4 ? '#d9b24a' : '#8fe3b5', { '--tx': rnd(-40, 40).toFixed(0) + 'px', '--ty': rnd(10, 60).toFixed(0) + 'px' });
        setTimeout(function (g) { g.remove(); }, 1200, g);
      }
    }, 70);
    after(3400, function () { clearInterval(trailTimer); setStage('s-land'); });
    after(4900, function () { setStage('s-flip'); });
    after(6000, function () { setStage('s-seal'); });
    after(6700, function () {
      var r = overlay.querySelector('.ki-seal').getBoundingClientRect();
      burst(sparks, r.left + r.width / 2, r.top + r.height / 2, 16, 40, 140);
    });
    after(7200, function () { setStage('s-open'); });
    after(8200, function () { setStage('s-rise'); });
    after(9400, function () { setStage('s-read'); });
  }
  function finish() {
    if (!overlay) return;
    clearTimers();
    if (obs) { obs.disconnect(); obs = null; }
    lsSet(SEEN_KEY, '1');
    overlay.classList.add('ki-out');
    html.classList.remove('ki-pending');
    lightCandles();
    var o = overlay; overlay = null;
    setTimeout(function () { o.remove(); if (replayBtn) replayBtn.hidden = false; }, 950);
  }

  /* ---------------------------------------------------------------
     Старт
     --------------------------------------------------------------- */
  function init() {
    document.body.insertAdjacentHTML('afterbegin', defs());
    buildDock();
    if (lsGet(SEEN_KEY) === '1') {
      html.classList.remove('ki-pending');
      lightCandles();
      replayBtn.hidden = false;
      if (lsGet(MUTE_KEY) !== '1') startAudio();   // автоплей заблокирован – подхватим на первом клике
    } else {
      openIntro(false);
    }
    // кнопка звука должна ловить язык страницы
    html.addEventListener('rt-lang', updateDock);
  }
  if (document.body) init(); else document.addEventListener('DOMContentLoaded', init);

  // для отладки из консоли: KI.open(), KI.stage('s-land'|'s-flip'|'s-seal'|'s-open'|'s-rise'|'s-read'), KI.finish()
  window.KI = {
    open: function () { openIntro(true); },
    stage: function (s) { if (!overlay) openIntro(true); clearTimers(); overlay.querySelector('.ki-idle').classList.add('ki-hide'); setStage(s); },
    play: function () { if (!overlay) openIntro(true); play(); },
    finish: finish,
    audio: function () { return audio; },
    crest: crestSvg
  };
})();

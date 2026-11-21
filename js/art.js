/* All drawings, made in code: shared SVG defs, icons, Ori, the rocket, and the yard scene. */
(function (root) {
  var SW = root.SW = root.SW || {};
  var A = SW.art = {};

  A.defs = '' +
  '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>' +
  '<linearGradient id="g-suit" x1="0" x2="1"><stop offset="0" stop-color="#c2cee0"/><stop offset="0.45" stop-color="#f4f7fc"/><stop offset="1" stop-color="#a9b8cf"/></linearGradient>' +
  '<linearGradient id="g-suit-dark" x1="0" x2="1"><stop offset="0" stop-color="#8395b1"/><stop offset="1" stop-color="#5f7190"/></linearGradient>' +
  '<radialGradient id="g-helm" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stop-color="#ffffff"/><stop offset="0.6" stop-color="#dbe4f0"/><stop offset="1" stop-color="#9fb0c9"/></radialGradient>' +
  '<linearGradient id="g-visor" x1="0.2" y1="0" x2="0.8" y2="1"><stop offset="0" stop-color="#3b6497"/><stop offset="0.45" stop-color="#132644"/><stop offset="1" stop-color="#070d1a"/></linearGradient>' +
  '<linearGradient id="g-hull" x1="0" x2="1"><stop offset="0" stop-color="#4a6890"/><stop offset="0.38" stop-color="#e9eff9"/><stop offset="0.62" stop-color="#bcd3ee"/><stop offset="1" stop-color="#3d5a82"/></linearGradient>' +
  '<linearGradient id="g-fin" x1="0" x2="1"><stop offset="0" stop-color="#2f4a70"/><stop offset="1" stop-color="#5b82b3"/></linearGradient>' +
  '<linearGradient id="g-nose" x1="0" x2="1"><stop offset="0" stop-color="#c7601f"/><stop offset="0.4" stop-color="#ffb27d"/><stop offset="1" stop-color="#d96a26"/></linearGradient>' +
  '<linearGradient id="g-bell" x1="0" x2="1"><stop offset="0" stop-color="#1c2a42"/><stop offset="0.5" stop-color="#5a6f90"/><stop offset="1" stop-color="#1c2a42"/></linearGradient>' +
  '<radialGradient id="g-flame" cx="0.5" cy="0" r="1"><stop offset="0" stop-color="#fff4e6"/><stop offset="0.25" stop-color="#ffb27d"/><stop offset="0.6" stop-color="#ff8a3d" stop-opacity="0.7"/><stop offset="1" stop-color="#ff8a3d" stop-opacity="0"/></radialGradient>' +
  '<radialGradient id="g-moon" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stop-color="#d8dfea"/><stop offset="0.7" stop-color="#6f7c92"/><stop offset="1" stop-color="#262f40"/></radialGradient>' +
  '<linearGradient id="g-panel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a4f82"/><stop offset="1" stop-color="#13284a"/></linearGradient>' +
  '<linearGradient id="g-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050a14"/><stop offset="0.65" stop-color="#11243f"/><stop offset="1" stop-color="#29446c"/></linearGradient>' +
  '<filter id="f-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>' +
  '<filter id="f-soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2"/></filter>' +

  // Ori
  '<symbol id="sym-ori" viewBox="0 0 200 280">' +
  '<rect x="50" y="94" width="100" height="104" rx="20" fill="url(#g-suit-dark)"/>' +
  '<rect x="69" y="192" width="28" height="60" rx="12" fill="url(#g-suit)"/><rect x="103" y="192" width="28" height="60" rx="12" fill="url(#g-suit)"/>' +
  '<rect x="71" y="214" width="24" height="11" rx="5.5" fill="#c9d4e4" stroke="#8b9cb6"/><rect x="105" y="214" width="24" height="11" rx="5.5" fill="#c9d4e4" stroke="#8b9cb6"/>' +
  '<rect x="60" y="246" width="44" height="18" rx="8" fill="#2b3a55"/><rect x="96" y="246" width="44" height="18" rx="8" fill="#2b3a55"/>' +
  '<rect x="60" y="104" width="80" height="98" rx="28" fill="url(#g-suit)"/>' +
  '<rect x="78" y="128" width="44" height="30" rx="6" fill="#17243b" stroke="#4f77a8"/>' +
  '<circle cx="87" cy="137" r="3" fill="#ff8a3d"/><circle cx="96" cy="137" r="3" fill="#9cc3ee"/><circle cx="105" cy="137" r="3" fill="#8fdcb2"/>' +
  '<rect x="85" y="146" width="30" height="3" rx="1.5" fill="#4f77a8"/><rect x="85" y="151" width="18" height="3" rx="1.5" fill="#4f77a8" opacity="0.6"/>' +
  '<rect x="60" y="178" width="80" height="9" rx="3" fill="#8b9cb6"/><rect x="93" y="177" width="14" height="11" rx="2.5" fill="#ff8a3d"/>' +
  '<g transform="rotate(9 52 114)"><rect x="40" y="108" width="24" height="70" rx="12" fill="url(#g-suit)"/><rect x="41" y="164" width="22" height="7" rx="3" fill="#ff8a3d"/><rect x="40" y="170" width="24" height="20" rx="10" fill="#7d8ea9"/></g>' +
  '<g transform="rotate(-9 148 114)"><rect x="136" y="108" width="24" height="70" rx="12" fill="url(#g-suit)"/><rect x="137" y="164" width="22" height="7" rx="3" fill="#ff8a3d"/><rect x="136" y="170" width="24" height="20" rx="10" fill="#7d8ea9"/></g>' +
  '<circle cx="72" cy="122" r="7" fill="#1d3356" stroke="#e9eff9" stroke-width="1.5"/><path d="M68 124 l4 -6 l4 6" stroke="#ff8a3d" stroke-width="1.5" fill="none"/>' +
  '<rect x="70" y="100" width="60" height="12" rx="6" fill="#aebdd2" stroke="#8b9cb6"/>' +
  '<circle cx="100" cy="64" r="46" fill="url(#g-helm)" stroke="#8b9cb6" stroke-width="1.2"/>' +
  '<rect x="143" y="54" width="9" height="18" rx="3.5" fill="#d7e0ec" stroke="#8b9cb6"/><rect x="145" y="57" width="5" height="6" rx="2" fill="#ffb27d"/>' +
  '<path d="M66 66 C66 44 82 36 100 36 C118 36 134 44 134 66 C134 84 120 94 100 94 C80 94 66 84 66 66 Z" fill="url(#g-visor)" stroke="#6f819e" stroke-width="3"/>' +
  '<path d="M76 58 C80 47 90 42 102 42" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.55"/>' +
  '<ellipse cx="117" cy="80" rx="8" ry="3.5" fill="#ff8a3d" opacity="0.55" transform="rotate(-20 117 80)"/>' +
  '</symbol>' +

  // Rocket body (no flame)
  '<symbol id="sym-rocket" viewBox="0 0 120 270">' +
  '<path d="M36 188 L12 236 L12 254 L36 240 Z" fill="url(#g-fin)"/><path d="M84 188 L108 236 L108 254 L84 240 Z" fill="url(#g-fin)"/>' +
  '<path d="M60 6 C79 30 86 58 86 92 L86 240 L34 240 L34 92 C34 58 41 30 60 6 Z" fill="url(#g-hull)"/>' +
  '<path d="M60 6 C69 18 74 28 77 40 L43 40 C46 28 51 18 60 6 Z" fill="url(#g-nose)"/>' +
  '<path d="M34 92 H86 M34 146 H86 M35 196 H85" stroke="#2c4366" stroke-width="1" opacity="0.6"/>' +
  '<rect x="34" y="146" width="52" height="9" fill="#4f77a8" opacity="0.85"/><rect x="34" y="200" width="52" height="4" fill="#ff8a3d"/>' +
  '<circle cx="60" cy="110" r="11" fill="#0a1322" stroke="#5b82b3" stroke-width="3"/>' +
  '<path d="M53 106 C55 102 59 100 63 100" stroke="#9cc3ee" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.8"/>' +
  '<path d="M44 240 H76 L84 262 H36 Z" fill="url(#g-bell)"/>' +
  '</symbol>' +
  // Rocket outline for parts not built yet
  '<symbol id="sym-rocket-outline" viewBox="0 0 120 270">' +
  '<g fill="none" stroke="#9cc3ee" stroke-opacity="0.45" stroke-width="2.5" stroke-dasharray="6 6">' +
  '<path d="M60 6 C79 30 86 58 86 92 L86 240 L34 240 L34 92 C34 58 41 30 60 6 Z"/><path d="M36 188 L12 236 L12 254 L36 240 M84 188 L108 236 L108 254 L84 240"/><path d="M44 240 H76 L84 262 H36 Z"/>' +
  '</g></symbol>' +
  '<symbol id="sym-flame" viewBox="0 0 60 120" overflow="visible">' +
  '<ellipse cx="30" cy="40" rx="30" ry="50" fill="#ff8a3d" opacity="0.35" filter="url(#f-glow)"/>' +
  '<path class="flick" d="M6 0 C10 50 22 90 30 118 C38 90 50 50 54 0 Z" fill="url(#g-flame)"/>' +
  '<path class="flick" d="M18 0 C20 30 26 54 30 70 C34 54 40 30 42 0 Z" fill="#fff4e6" opacity="0.85"/>' +
  '</symbol>' +

  // Line icons (16x16)
  icon('bolt', '<path d="M5 2h6l2 3-5 9-5-9z"/><path d="M3 5h10"/>') +
  icon('wire', '<circle cx="8" cy="8" r="5.5"/><circle cx="8" cy="8" r="2"/><path d="M13.5 8H15"/>') +
  icon('fuel', '<path d="M8 2c2.5 3.2 4 5.4 4 7.5a4 4 0 0 1-8 0C4 7.4 5.5 5.2 8 2z"/>') +
  icon('hull', '<rect x="2.5" y="4" width="11" height="8" rx="1.5"/><path d="M6 4v8M10 4v8"/>') +
  icon('engine', '<path d="M5 2h6v5l2 7H3l2-7z"/><path d="M5 7h6"/>') +
  icon('chip', '<rect x="4" y="4" width="8" height="8" rx="1"/><path d="M6 2v2M10 2v2M6 12v2M10 12v2M2 6h2M2 10h2M12 6h2M12 10h2"/>') +
  icon('kiln', '<path d="M8 2l5 2v4c0 3-2.2 5.2-5 6-2.8-.8-5-3-5-6V4z"/><path d="M8 6v4"/>') +
  icon('tower', '<path d="M5 14V2M11 14V2M5 4l6 3-6 3 6 3"/>') +
  icon('factory', '<path d="M2 14V7l4 2V7l4 2V3h3v11z" stroke-linejoin="round"/>') +
  icon('up', '<path d="M8 13V3M4 7l4-4 4 4"/>') +
  icon('rocket', '<path d="M8 1.5c2 2 2.8 4.5 2.8 7.5v3H5.2V9c0-3 .8-5.5 2.8-7.5z"/><path d="M5.2 10l-2 3h2M10.8 10l2 3h-2"/>') +
  icon('station', '<circle cx="8" cy="8" r="2.5"/><path d="M1 8h4.5M10.5 8H15"/><rect x="1" y="5" width="3" height="6"/><rect x="12" y="5" width="3" height="6"/>') +
  icon('more', '<circle cx="4" cy="8" r="0.6"/><circle cx="8" cy="8" r="0.6"/><circle cx="12" cy="8" r="0.6"/>') +
  icon('lock', '<rect x="3.5" y="7" width="9" height="7" rx="1.5"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/>') +
  icon('check', '<path d="M3 8.5l3 3 7-7"/>') +
  '</defs></svg>';

  function icon(id, body) {
    return '<symbol id="i-' + id + '" viewBox="0 0 16 16"><g fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round">' + body + '</g></symbol>';
  }
  A.icon = function (id, cls) { return '<svg class="ic ' + (cls || '') + '" aria-hidden="true"><use href="#i-' + id + '"/></svg>'; };
  A.ori = function (size) { return '<svg class="ori" width="' + size + '" height="' + Math.round(size * 1.4) + '" viewBox="0 0 200 280" aria-hidden="true"><use href="#sym-ori"/></svg>'; };

  // ---------- The yard scene ----------
  // Buildings, left to right. Each one lights up once you own that factory.
  var B = [
    { x: 6,   w: 26, h: 20, roof: 'flat' },
    { x: 36,  w: 32, h: 28, roof: 'saw' },
    { x: 72,  w: 26, h: 22, roof: 'tank' },
    { x: 102, w: 36, h: 32, roof: 'flat', chimney: 120 },
    { x: 142, w: 30, h: 42, roof: 'flat', chimney: 160 },
    { x: 176, w: 22, h: 54, roof: 'antenna' },
    { x: 202, w: 30, h: 30, roof: 'dome', chimney: 224 }
  ];
  var GROUND = 132;

  function rnd(seed) { return function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }; }

  function building(b, i) {
    var top = GROUND - b.h, s = '';
    s += '<g id="bld-' + i + '" class="bld">';
    if (b.chimney) s += '<rect x="' + b.chimney + '" y="' + (top - 12) + '" width="5" height="12" class="b-body"/>' +
      '<g class="smoke"><circle cx="' + (b.chimney + 2.5) + '" cy="' + (top - 16) + '" r="3.5"/><circle cx="' + (b.chimney + 5) + '" cy="' + (top - 23) + '" r="4.5"/><circle cx="' + (b.chimney + 3) + '" cy="' + (top - 31) + '" r="5.5"/></g>';
    if (b.roof === 'saw') {
      var p = 'M' + b.x + ' ' + top;
      for (var k = 0; k < 4; k++) { var x0 = b.x + k * b.w / 4; p += ' L' + (x0 + b.w / 4) + ' ' + (top - 6) + ' L' + (x0 + b.w / 4) + ' ' + top; }
      s += '<path d="' + p + ' Z" class="b-body"/>';
    }
    if (b.roof === 'tank') s += '<rect x="' + (b.x + b.w - 6) + '" y="' + (top - 14) + '" width="14" height="' + (b.h + 14) + '" rx="7" class="b-body"/>';
    if (b.roof === 'antenna') s += '<path d="M' + (b.x + b.w / 2) + ' ' + top + ' V' + (top - 14) + '" class="b-line"/><circle cx="' + (b.x + b.w / 2) + '" cy="' + (top - 15) + '" r="1.6" class="b-beacon"/>';
    if (b.roof === 'dome') s += '<path d="M' + b.x + ' ' + top + ' A' + (b.w / 2) + ' 8 0 0 1 ' + (b.x + b.w) + ' ' + top + ' Z" class="b-body"/>';
    s += '<rect x="' + b.x + '" y="' + top + '" width="' + b.w + '" height="' + b.h + '" class="b-body"/>';
    var r = rnd(17 + i * 31);
    for (var yy = top + 5; yy < GROUND - 5; yy += 7) {
      for (var xx = b.x + 4; xx < b.x + b.w - 4; xx += 6) {
        s += '<rect x="' + xx + '" y="' + yy + '" width="3" height="2.5" class="win' + (r() < 0.62 ? ' on' : '') + '"/>';
      }
    }
    s += '</g>';
    return s;
  }

  A.scene = function () {
    var s = '<svg viewBox="0 0 360 150" preserveAspectRatio="xMidYMax slice" aria-hidden="true">';
    s += '<rect width="360" height="150" fill="url(#g-sky)"/>';
    var r = rnd(5);
    s += '<g fill="#e9eff9">';
    for (var i = 0; i < 46; i++) s += '<circle cx="' + (r() * 360).toFixed(1) + '" cy="' + (r() * 90).toFixed(1) + '" r="' + (r() * 0.8 + 0.25).toFixed(2) + '" opacity="' + (r() * 0.6 + 0.2).toFixed(2) + '"/>';
    s += '</g>';
    s += '<circle cx="46" cy="30" r="10" fill="url(#g-moon)" opacity="0.9"/><circle cx="43" cy="27" r="2" fill="#4b566a" opacity="0.45"/>' +
      '<circle id="moon-light" class="moonlight" cx="49" cy="34" r="1.3" fill="#ff8a3d"/>' +
      '<circle id="mars-dot" class="marsdot" cx="96" cy="18" r="2.2" fill="#e0703a"/>';
    // Harbor Station (appears after the first launch)
    s += '<g id="station" class="station" transform="translate(165 28)"><ellipse cx="0" cy="0" rx="34" ry="8" fill="none" stroke="#9cc3ee" stroke-opacity="0.25" stroke-dasharray="2 3"/>' +
      '<rect x="-4" y="-3" width="8" height="6" rx="1.5" fill="#cfdcee"/><rect x="-16" y="-5" width="9" height="10" fill="none" stroke="#9cc3ee" stroke-width="0.8"/><rect x="7" y="-5" width="9" height="10" fill="none" stroke="#9cc3ee" stroke-width="0.8"/>' +
      '<path d="M-7 0 H-4 M4 0 H7" stroke="#9cc3ee" stroke-width="0.8"/><circle cx="0" cy="0" r="1" fill="#ff8a3d"/>' +
      '<text id="station-label" x="0" y="17" text-anchor="middle" class="s-label">HARBOR</text></g>';
    s += '<path d="M0 116 C40 106 80 112 120 104 C160 96 200 108 240 100 C280 94 320 104 360 98 V150 H0 Z" fill="#0f1f39"/>';
    for (var b = 0; b < B.length; b++) s += building(B[b], b);
    s += '<rect x="0" y="' + GROUND + '" width="360" height="18" fill="#071120"/><path d="M0 ' + GROUND + ' H360" stroke="rgba(156,195,238,0.25)" stroke-width="0.6"/>';
    // Launch Tower gantry (8th factory)
    s += '<g id="bld-7" class="bld gantry"><path d="M262 30 V132 M272 30 V132" class="g-line"/>' +
      '<path d="M262 36 L272 44 L262 52 L272 60 L262 68 L272 76 L262 84 L272 92 L262 100 L272 108 L262 116 L272 124" class="g-line"/>' +
      '<path d="M272 50 H282 M272 98 H282" class="g-line"/><circle cx="267" cy="29" r="1.8" class="b-beacon"/></g>';
    // Rocket on the pad: outline + built part (clipped from the bottom up)
    s += '<g id="rocket-wrap"><clipPath id="rk-clip"><rect id="rk-clip-rect" x="270" y="150" width="70" height="120"/></clipPath>' +
      '<g id="rocket"><use href="#sym-flame" id="rk-flame" x="297" y="134" width="20" height="50"/>' +
      '<use href="#sym-rocket-outline" x="283" y="28" width="48" height="108"/>' +
      '<g clip-path="url(#rk-clip)"><use href="#sym-rocket" x="283" y="28" width="48" height="108"/></g></g></g>';
    s += '<ellipse cx="307" cy="134" rx="26" ry="3" fill="#9cc3ee" opacity="0.15" filter="url(#f-soft)"/>';
    s += '<use href="#sym-ori" id="scene-ori" x="238" y="111" width="15" height="21"/>';
    s += '</svg>';
    return s;
  };

  // ---------- Harbor Station ----------
  // Each module is a group; modules not built yet are drawn as dashed outlines (see .stn CSS).
  function panels(x, y) {
    var s = '';
    [[0, 0], [0, 24], [52, 0], [52, 24]].forEach(function (o) {
      var px = x + o[0], py = y + o[1];
      s += '<rect x="' + px + '" y="' + py + '" width="46" height="20" rx="1.5" class="pn"/>';
      for (var k = 1; k < 6; k++) s += '<path d="M' + (px + k * 46 / 6).toFixed(1) + ' ' + py + ' V' + (py + 20) + '" class="pl"/>';
      s += '<path d="M' + px + ' ' + (py + 10) + ' H' + (px + 46) + '" class="pl"/>';
    });
    return s;
  }
  A.station = function () {
    var r = rnd(9), s = '<svg viewBox="0 0 340 190" aria-hidden="true">';
    s += '<rect width="340" height="190" fill="#050a14"/><g fill="#e9eff9">';
    for (var i = 0; i < 40; i++) s += '<circle cx="' + (r() * 340).toFixed(1) + '" cy="' + (r() * 130).toFixed(1) + '" r="' + (r() * 0.8 + 0.2).toFixed(2) + '" opacity="' + (r() * 0.6 + 0.2).toFixed(2) + '"/>';
    s += '</g>';
    // Earth below
    s += '<defs><radialGradient id="g-earth" cx="0.4" cy="0.05" r="0.9"><stop offset="0" stop-color="#3f6ea6"/><stop offset="0.35" stop-color="#1b3a63"/><stop offset="1" stop-color="#060c18"/></radialGradient>' + '</defs>';
    s += '<circle cx="170" cy="560" r="400" fill="#9cc3ee" opacity="0.25" filter="url(#f-glow)"/>';
    s += '<circle cx="170" cy="560" r="400" fill="url(#g-earth)"/>';
    s += '<path d="M-60 214 A400 400 0 0 1 400 214" fill="none" stroke="#bfe0ff" stroke-width="2" opacity="0.6"/>';
    s += '<g class="stn" transform="translate(0 -6)">';
    s += '<g class="m" id="mod-solar"><path d="M128 84 H40 M212 84 H300" class="tr"/>' + panels(30, 56) + panels(212, 56) + '</g>';
    s += '<g class="m" id="mod-hab"><ellipse cx="170" cy="84" rx="66" ry="21" class="ring"/><path d="M170 63 V105 M104 84 H236" class="tr"/></g>';
    s += '<g class="m" id="mod-cargo"><rect x="120" y="76" width="26" height="16" rx="3" class="hull"/><rect x="194" y="76" width="26" height="16" rx="3" class="hull"/>' +
      '<path d="M128 76 V92 M136 76 V92 M202 76 V92 M210 76 V92" class="pl2"/></g>';
    s += '<g class="m" id="mod-core"><rect x="146" y="71" width="48" height="26" rx="8" class="hull"/><path d="M158 71 V97 M182 71 V97" class="pl2"/>' +
      '<circle cx="152" cy="84" r="2.4" class="win"/><circle cx="188" cy="84" r="2.4" class="win"/><rect x="146" y="82" width="48" height="3" class="band"/></g>';
    s += '<g class="m" id="mod-lab"><rect x="159" y="40" width="22" height="31" rx="5" class="hull"/>' +
      '<rect x="164" y="47" width="4" height="3" class="win"/><rect x="172" y="47" width="4" height="3" class="win"/><rect x="164" y="55" width="4" height="3" class="win"/><rect x="172" y="55" width="4" height="3" class="win"/></g>';
    s += '<g class="m" id="mod-obs"><path d="M160 40 A10 9 0 0 1 180 40 Z" class="hull"/><path d="M178 33 L194 20" class="tr"/><ellipse cx="196" cy="18" rx="7" ry="3" transform="rotate(-38 196 18)" class="hull"/></g>';
    s += '<g class="m" id="mod-dock"><rect x="163" y="97" width="14" height="16" rx="2" class="hull"/><circle cx="170" cy="118" r="6" class="ringsm"/><circle cx="170" cy="118" r="2" class="win"/></g>';
    s += '<g class="m" id="mod-odcore"><circle cx="170" cy="84" r="9" class="glow"/><circle cx="170" cy="84" r="4.5" class="odc"/></g>';
    s += '</g></svg>';
    return s;
  };

  // ---------- Moon base (Era IV) ----------
  A.moon = function () {
    var r = rnd(21), s = '<svg viewBox="0 0 340 170" aria-hidden="true">';
    s += '<defs><radialGradient id="g-lunar" cx="0.5" cy="0" r="1"><stop offset="0" stop-color="#5d6a80"/><stop offset="0.6" stop-color="#2b3445"/><stop offset="1" stop-color="#12171f"/></radialGradient>' +
      '<radialGradient id="g-earth2" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stop-color="#5b8fd0"/><stop offset="0.6" stop-color="#1d3c66"/><stop offset="1" stop-color="#08111f"/></radialGradient></defs>';
    s += '<rect width="340" height="170" fill="#03060c"/><g fill="#e9eff9">';
    for (var i = 0; i < 50; i++) s += '<circle cx="' + (r() * 340).toFixed(1) + '" cy="' + (r() * 110).toFixed(1) + '" r="' + (r() * 0.8 + 0.2).toFixed(2) + '" opacity="' + (r() * 0.6 + 0.2).toFixed(2) + '"/>';
    s += '</g>';
    s += '<circle cx="62" cy="38" r="24" fill="#9cc3ee" opacity="0.25" filter="url(#f-glow)"/><circle cx="62" cy="38" r="20" fill="url(#g-earth2)"/>' +
      '<path d="M45 28 A20 20 0 0 1 70 19" stroke="#bfe0ff" stroke-width="1.5" fill="none" opacity="0.8"/>' +
      '<ellipse cx="56" cy="34" rx="7" ry="3" fill="#e9eff9" opacity="0.18"/>';
    s += '<path d="M0 118 C80 104 170 100 340 112 V170 H0 Z" fill="url(#g-lunar)"/>';
    s += '<g fill="#1a212d" opacity="0.7"><ellipse cx="40" cy="140" rx="16" ry="4"/><ellipse cx="150" cy="152" rx="22" ry="5"/><ellipse cx="300" cy="138" rx="12" ry="3"/><ellipse cx="250" cy="160" rx="18" ry="4"/></g>';
    s += '<g class="stn">';
    // Mass Driver rail
    s += '<g class="m" id="moon-driver"><path d="M200 120 L330 46" class="tr"/><path d="M206 124 L334 51" class="tr"/>' +
      [0, 1, 2, 3, 4, 5].map(function (k) { var x = 214 + k * 20, y = 115 - k * 11.4; return '<ellipse cx="' + x + '" cy="' + y + '" rx="3" ry="7" transform="rotate(-30 ' + x + ' ' + y + ')" class="ringsm"/>'; }).join('') +
      '<circle cx="330" cy="47" r="2.5" class="odc"/></g>';
    // Base dome + hab
    s += '<g class="m on" id="moon-base"><path d="M60 118 A20 16 0 0 1 100 118 Z" class="hull"/><rect x="98" y="108" width="26" height="11" rx="4" class="hull"/>' +
      '<rect x="66" y="112" width="4" height="3" class="win"/><rect x="74" y="110" width="4" height="3" class="win"/><rect x="104" y="111" width="4" height="3" class="win"/><rect x="112" y="111" width="4" height="3" class="win"/></g>';
    // Fusion reactor
    s += '<g class="m" id="moon-fusion"><circle cx="40" cy="112" r="12" class="glow" id="fusion-glow"/><ellipse cx="40" cy="112" rx="11" ry="5" class="ring"/><circle cx="40" cy="112" r="3.5" class="odc"/></g>';
    // Rigs
    s += '<g class="m" id="rig-scoop"><rect x="130" y="113" width="16" height="7" rx="2" class="hull"/><path d="M146 114 L156 106 L160 112" class="tr"/><circle cx="134" cy="121" r="2" class="ringsm"/><circle cx="142" cy="121" r="2" class="ringsm"/></g>';
    s += '<g class="m" id="rig-extractor"><rect x="166" y="92" width="6" height="26" class="hull"/><rect x="174" y="102" width="12" height="16" rx="5" class="hull"/><circle cx="169" cy="90" r="1.6" class="win"/></g>';
    s += '<g class="m" id="rig-crawler"><rect x="234" y="124" width="40" height="12" rx="3" class="hull"/><rect x="240" y="116" width="18" height="8" rx="2" class="hull"/>' +
      '<rect x="232" y="134" width="44" height="6" rx="3" class="ringsm"/><path d="M274 126 L288 118" class="tr"/><rect x="244" y="118" width="4" height="3" class="win"/></g>';
    s += '</g></svg>';
    return s;
  };

  // ---------- Mars colony (Era V) ----------
  // Domes light up as colonists arrive (see CONFIG-free thresholds in A.marsDomes).
  A.marsDomes = [1, 4, 9, 16, 25, 40, 60, 90];
  A.mars = function () {
    var r = rnd(33), s = '<svg viewBox="0 0 340 170" aria-hidden="true">';
    s += '<defs><linearGradient id="g-msky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#07060b"/><stop offset="0.7" stop-color="#2a1410"/><stop offset="1" stop-color="#6b2e18"/></linearGradient>' +
      '<linearGradient id="g-mground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a4424"/><stop offset="1" stop-color="#3a160c"/></linearGradient>' +
      '<radialGradient id="g-dome" cx="0.35" cy="0.25" r="0.9"><stop offset="0" stop-color="#d8ecff" stop-opacity="0.9"/><stop offset="0.6" stop-color="#7fa6cf" stop-opacity="0.55"/><stop offset="1" stop-color="#2b4a70" stop-opacity="0.6"/></radialGradient></defs>';
    s += '<rect width="340" height="170" fill="url(#g-msky)"/><g fill="#f3e6dc">';
    for (var i = 0; i < 40; i++) s += '<circle cx="' + (r() * 340).toFixed(1) + '" cy="' + (r() * 80).toFixed(1) + '" r="' + (r() * 0.7 + 0.2).toFixed(2) + '" opacity="' + (r() * 0.5 + 0.2).toFixed(2) + '"/>';
    s += '</g>';
    s += '<circle cx="270" cy="30" r="5" fill="url(#g-moon)"/><circle cx="90" cy="22" r="1.6" fill="#7fb3ff"/><circle cx="90" cy="22" r="4" fill="#7fb3ff" opacity="0.25" filter="url(#f-soft)"/>';
    s += '<path d="M0 104 L40 96 L58 86 L96 86 L112 98 L180 100 L210 90 L240 90 L256 100 L340 96 V170 H0 Z" fill="#5a2414" opacity="0.8"/>';
    s += '<path d="M0 120 C70 108 160 112 220 116 C270 119 310 112 340 114 V170 H0 Z" fill="url(#g-mground)"/>';
    s += '<g fill="#2a0f08" opacity="0.5"><ellipse cx="60" cy="150" rx="20" ry="4"/><ellipse cx="270" cy="156" rx="26" ry="5"/></g>';
    // Lander
    s += '<g transform="translate(250 98)"><path d="M0 20 L6 6 H22 L28 20" stroke="#c9d4e4" stroke-width="1.4" fill="none"/><rect x="5" y="-6" width="18" height="13" rx="3" fill="url(#g-hull)"/><circle cx="14" cy="0" r="2" fill="#ffb27d"/></g>';
    // Domes and tubes
    var domes = [[120, 120, 18], [150, 116, 12], [92, 122, 11], [176, 120, 14], [70, 124, 9], [200, 122, 10], [134, 132, 8], [220, 126, 8]];
    s += '<path d="M70 124 H220" stroke="#c9d4e4" stroke-opacity="0.35" stroke-width="2"/>';
    s += '<g class="stn">';
    domes.forEach(function (d, i) {
      s += '<g class="m" id="dome-' + i + '"><path d="M' + (d[0] - d[2]) + ' ' + d[1] + ' A' + d[2] + ' ' + (d[2] * 0.8) + ' 0 0 1 ' + (d[0] + d[2]) + ' ' + d[1] + ' Z" class="dome"/>' +
        '<rect x="' + (d[0] - 3) + '" y="' + (d[1] - 4) + '" width="2.5" height="2" class="win"/><rect x="' + (d[0] + 1) + '" y="' + (d[1] - 4) + '" width="2.5" height="2" class="win"/></g>';
    });
    s += '</g>';
    s += '<use href="#sym-ori" x="232" y="112" width="12" height="17"/>';
    s += '<path d="M246 112 V100" stroke="#c9d4e4" stroke-width="0.8"/><path d="M246 100 h8 v5 h-8 z" fill="#ff8a3d"/>';
    s += '</svg>';
    return s;
  };

  // ---------- Kestrel (Era VI) ----------
  // 12 segment groups, ids kseg-0 .. kseg-11, in the same order as CONFIG.kestrel.segments.
  A.kestrel = function () {
    var r = rnd(57), s = '<svg viewBox="0 0 340 150" aria-hidden="true">';
    s += '<rect width="340" height="150" fill="#04070e"/><g fill="#e9eff9">';
    for (var i = 0; i < 70; i++) s += '<circle cx="' + (r() * 340).toFixed(1) + '" cy="' + (r() * 150).toFixed(1) + '" r="' + (r() * 0.8 + 0.2).toFixed(2) + '" opacity="' + (r() * 0.6 + 0.15).toFixed(2) + '"/>';
    s += '</g><g class="stn kes">';
    var parts = [
      // 0 keel
      '<rect x="44" y="72" width="256" height="6" rx="2" class="hull"/>',
      // 1 bridge
      '<path d="M298 64 L326 75 L298 86 Z" class="hull"/><rect x="306" y="72" width="7" height="3" class="win"/>',
      // 2 forward hab ring
      '<ellipse cx="262" cy="75" rx="7" ry="30" class="ring"/><path d="M262 45 V105" class="tr"/>',
      // 3 cargo spine
      '<rect x="206" y="58" width="36" height="12" rx="2" class="hull"/><rect x="206" y="80" width="36" height="12" rx="2" class="hull"/><path d="M218 58 V70 M230 58 V70 M218 80 V92 M230 80 V92" class="pl2"/>',
      // 4 aft hab ring
      '<ellipse cx="186" cy="75" rx="7" ry="30" class="ring"/><path d="M186 45 V105" class="tr"/>',
      // 5 shield array
      '<path d="M330 54 Q340 75 330 96" class="tr"/><path d="M334 60 Q342 75 334 90" class="tr"/>',
      // 6 hydroponics
      '<rect x="128" y="62" width="40" height="26" rx="6" class="hull"/><rect x="134" y="67" width="28" height="16" rx="3" class="green"/>',
      // 7 reactor core
      '<circle cx="106" cy="75" r="13" class="hull"/><circle cx="106" cy="75" r="6" class="odc"/><circle cx="106" cy="75" r="13" class="glow"/>',
      // 8 solar wings
      '<rect x="132" y="14" width="80" height="22" rx="1.5" class="pn"/><rect x="132" y="114" width="80" height="22" rx="1.5" class="pn"/><path d="M172 36 V62 M172 88 V114" class="tr"/>' +
        [0, 1, 2, 3, 4, 5, 6].map(function (k) { var x = 142 + k * 10; return '<path d="M' + x + ' 14 V36 M' + x + ' 114 V136" class="pl"/>'; }).join(''),
      // 9 navigation
      '<path d="M280 64 L288 40" class="tr"/><ellipse cx="290" cy="37" rx="8" ry="3" transform="rotate(-25 290 37)" class="hull"/><circle cx="288" cy="40" r="1.4" class="win"/>',
      // 10 drive section
      '<rect x="56" y="60" width="34" height="30" rx="5" class="hull"/><rect x="56" y="73" width="34" height="4" class="band"/>',
      // 11 engine bells
      '<path d="M56 62 L36 54 V70 L56 70 Z M56 80 L36 80 V96 L56 88 Z" class="hull"/><ellipse cx="30" cy="62" rx="8" ry="6" class="glow"/><ellipse cx="30" cy="88" rx="8" ry="6" class="glow"/>'
    ];
    parts.forEach(function (p, k) { s += '<g class="m" id="kseg-' + k + '">' + p + '</g>'; });
    s += '</g></svg>';
    return s;
  };

  // Sections fill the rocket from the bottom: y (in scene units) where the built part starts.
  A.rocketClipY = function (built) {
    var fr = [270, 190, 146, 88, 0][built] / 270; // symbol units -> fraction of height
    return 28 + fr * 108;
  };
})(typeof window !== 'undefined' ? window : globalThis);

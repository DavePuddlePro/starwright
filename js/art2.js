/*
 * Detailed artwork (v2): the dusk launch yard, seven factory buildings, the gantry and a multi-stage rocket,
 * plus two-tone factory icons. All drawn in code as SVG strings, so the game can light buildings up,
 * build the rocket section by section, and recolour things without image files.
 */
(function (root) {
  var SW = root.SW = root.SW || {};
  var D = SW.art2 = {};
  function rnd(seed) { return function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }; }
  function f(n) { return Math.round(n * 10) / 10; }

  // ---------- Shared gradients ----------
  D.defs = '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>' +
    // rocket hull: a lit cylinder
    '<linearGradient id="a2-hull" x1="0" x2="1"><stop offset="0" stop-color="#5d7496"/><stop offset=".18" stop-color="#c9d6e8"/><stop offset=".36" stop-color="#ffffff"/><stop offset=".55" stop-color="#e8eff8"/><stop offset=".8" stop-color="#a7bad3"/><stop offset="1" stop-color="#53698c"/></linearGradient>' +
    '<linearGradient id="a2-hull-d" x1="0" x2="1"><stop offset="0" stop-color="#1a2840"/><stop offset=".35" stop-color="#3b5378"/><stop offset=".55" stop-color="#2c4264"/><stop offset="1" stop-color="#141f33"/></linearGradient>' +
    '<linearGradient id="a2-orng" x1="0" x2="1"><stop offset="0" stop-color="#b8541a"/><stop offset=".35" stop-color="#ffb27d"/><stop offset=".6" stop-color="#ff8a3d"/><stop offset="1" stop-color="#a8460f"/></linearGradient>' +
    '<linearGradient id="a2-bell" x1="0" x2="1"><stop offset="0" stop-color="#20283a"/><stop offset=".3" stop-color="#7d8aa3"/><stop offset=".5" stop-color="#c3ccda"/><stop offset=".7" stop-color="#6c7890"/><stop offset="1" stop-color="#1b2232"/></linearGradient>' +
    '<linearGradient id="a2-hullv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".25" stop-color="#e8eff8"/><stop offset=".6" stop-color="#a7bad3"/><stop offset="1" stop-color="#4c6285"/></linearGradient>' +
    '<linearGradient id="a2-orngv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffc79d"/><stop offset=".5" stop-color="#ff8a3d"/><stop offset="1" stop-color="#a8460f"/></linearGradient>' +
    '<linearGradient id="a2-fin" x1="0" x2="1"><stop offset="0" stop-color="#2a4166"/><stop offset="1" stop-color="#5e86bb"/></linearGradient>' +
    // buildings
    '<linearGradient id="a2-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34598c"/><stop offset="1" stop-color="#1d375c"/></linearGradient>' +
    '<linearGradient id="a2-wall2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2d5082"/><stop offset="1" stop-color="#183152"/></linearGradient>' +
    '<linearGradient id="a2-side" x1="0" x2="1"><stop offset="0" stop-color="#132644"/><stop offset="1" stop-color="#0f1f38"/></linearGradient>' +
    '<linearGradient id="a2-roof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a80b4"/><stop offset="1" stop-color="#2d4b77"/></linearGradient>' +
    '<linearGradient id="a2-tank" x1="0" x2="1"><stop offset="0" stop-color="#1b3254"/><stop offset=".3" stop-color="#5f88bf"/><stop offset=".5" stop-color="#8db2e0"/><stop offset=".72" stop-color="#3d6296"/><stop offset="1" stop-color="#14263f"/></linearGradient>' +
    '<linearGradient id="a2-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8fc0f0"/><stop offset=".45" stop-color="#3f6ea6"/><stop offset="1" stop-color="#1b3459"/></linearGradient>' +
    '<linearGradient id="a2-win" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe2bd"/><stop offset="1" stop-color="#ffa45c"/></linearGradient>' +
    '<radialGradient id="a2-furnace" cx=".5" cy=".6" r=".6"><stop offset="0" stop-color="#fff1d2"/><stop offset=".35" stop-color="#ffb066"/><stop offset=".8" stop-color="#ff7a29"/><stop offset="1" stop-color="#ff7a29" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="a2-glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffcf9e" stop-opacity=".75"/><stop offset="1" stop-color="#ffcf9e" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="a2-steam" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#eef3fb" stop-opacity=".55"/><stop offset="1" stop-color="#eef3fb" stop-opacity="0"/></radialGradient>' +
    '<linearGradient id="a2-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3e0" stop-opacity=".42"/><stop offset="1" stop-color="#fff3e0" stop-opacity="0"/></linearGradient>' +
    '<linearGradient id="a2-flame" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff4dc"/><stop offset=".4" stop-color="#ffb066"/><stop offset="1" stop-color="#ff7a29" stop-opacity="0"/></linearGradient>' +
    '<filter id="a2-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>' +
    '<filter id="a2-blur-s" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.2"/></filter>' +
    '</defs></svg>';

  // Windows grid helper: lit windows warm, unlit dark.
  function windows(x, y, cols, rows, w, h, gx, gy, lit, seed) {
    var r = rnd(seed), s = '';
    for (var j = 0; j < rows; j++) for (var i = 0; i < cols; i++) {
      var on = lit && r() < 0.72;
      s += '<rect x="' + f(x + i * gx) + '" y="' + f(y + j * gy) + '" width="' + w + '" height="' + h + '" rx=".5" fill="' + (on ? 'url(#a2-win)' : '#0d1b31') + '"' + (on ? ' opacity="' + (0.7 + r() * 0.3).toFixed(2) + '"' : '') + '/>';
    }
    return s;
  }
  // Rim light along a roof edge (moonlight from the upper right).
  function rim(x1, y, x2) { return '<path d="M' + x1 + ' ' + y + ' H' + x2 + '" stroke="#9cc3ee" stroke-width=".9" opacity=".55"/>'; }
  function smoke(x, y, s) {
    s = s || 1;
    return '<g fill="url(#a2-steam)"><circle cx="' + x + '" cy="' + (y - 6 * s) + '" r="' + (7 * s) + '"/><circle cx="' + (x + 5 * s) + '" cy="' + (y - 17 * s) + '" r="' + (10 * s) + '"/><circle cx="' + (x + 13 * s) + '" cy="' + (y - 31 * s) + '" r="' + (13 * s) + '"/></g>';
  }

  // ---------- Factories ----------
  // Each building IS its product: the Bolt Press is a giant bolt, the Wire Mill a spool, and so on.
  // lit = owned (windows on, glow, smoke). Not owned: drawn as a dashed blueprint (.fac2.ghost in CSS).
  function hex(cx, cy, r, fill, stroke) {
    var pts = [];
    for (var k = 0; k < 6; k++) { var a = Math.PI / 3 * k + Math.PI / 6; pts.push(f(cx + r * Math.cos(a)) + ',' + f(cy + r * Math.sin(a))); }
    return '<polygon points="' + pts.join(' ') + '" fill="' + fill + '"' + (stroke ? ' stroke="' + stroke + '" stroke-width=".6"' : '') + '/>';
  }
  function win(x, y, w, h, on, op) { return '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + w + '" height="' + h + '" rx=".5" fill="' + (on ? 'url(#a2-win)' : '#0d1b31') + '"' + (on && op ? ' opacity="' + op + '"' : '') + '/>'; }
  var FAC = {};

  // 1. Bolt Press: an upright giant bolt. Hex head on top, threaded shank below.
  FAC.bolt = function (x, gy, lit) {
    var s = '', cx = x + 28, headT = gy - 52, headB = gy - 34, shW = 30, shL = cx - shW / 2;
    // threaded shank
    s += '<rect x="' + shL + '" y="' + headB + '" width="' + shW + '" height="' + (gy - headB) + '" fill="url(#a2-tank)"/>';
    for (var yy = headB + 3; yy < gy - 2; yy += 5) s += '<path d="M' + shL + ' ' + (yy + 2) + ' L' + (shL + shW) + ' ' + yy + '" stroke="#16304f" stroke-width="1.6"/><path d="M' + shL + ' ' + (yy + 3.2) + ' L' + (shL + shW) + ' ' + (yy + 1.2) + '" stroke="#9cc3ee" stroke-width=".5" opacity=".5"/>';
    // a door cut into the bottom of the shank
    s += '<rect x="' + (cx - 5) + '" y="' + (gy - 10) + '" width="10" height="10" rx="1" fill="#0b1628"/>';
    if (lit) s += '<rect x="' + (cx - 4) + '" y="' + (gy - 9) + '" width="8" height="9" fill="url(#a2-win)" opacity=".55"/>';
    // washer
    s += '<rect x="' + (cx - 21) + '" y="' + (headB - 3) + '" width="42" height="4" rx="1.5" fill="#5a80b4"/>';
    // hex head seen from the front: three faces, the middle one lit
    s += '<path d="M' + (cx - 26) + ' ' + (headT + 4) + ' L' + (cx - 16) + ' ' + headT + ' V' + (headB - 3) + ' L' + (cx - 26) + ' ' + (headB - 6) + ' Z" fill="#203c63"/>';
    s += '<path d="M' + (cx + 26) + ' ' + (headT + 4) + ' L' + (cx + 16) + ' ' + headT + ' V' + (headB - 3) + ' L' + (cx + 26) + ' ' + (headB - 6) + ' Z" fill="#1a3254"/>';
    s += '<rect x="' + (cx - 16) + '" y="' + headT + '" width="32" height="' + (headB - 3 - headT) + '" fill="url(#a2-wall)"/>';
    s += '<path d="M' + (cx - 26) + ' ' + (headT + 4) + ' L' + (cx - 16) + ' ' + headT + ' H' + (cx + 16) + ' L' + (cx + 26) + ' ' + (headT + 4) + '" fill="none" stroke="#9cc3ee" stroke-width=".9" opacity=".7"/>';
    for (var i = 0; i < 4; i++) s += win(cx - 13 + i * 7, headT + 5, 5, 4, lit && i !== 2, .9);
    s += '<rect x="' + (cx - 13) + '" y="' + (headT + 12) + '" width="26" height="2" fill="#ff8a3d" opacity=".85"/>';
    // finished bolts tumbling out on a short belt
    s += '<rect x="' + (cx + 16) + '" y="' + (gy - 3.5) + '" width="20" height="2.5" rx="1" fill="#3d5f8f"/>';
    [cx + 21, cx + 27, cx + 33].forEach(function (bx) { s += hex(bx, gy - 6, 2.3, lit ? '#d8e9ff' : '#2b4670', '#7fa6d8'); });
    return s;
  };

  // 2. Wire Mill: a giant upright spool wound with copper wire.
  FAC.wire = function (x, gy, lit) {
    var s = '', cx = x + 22, top = gy - 52, fw = 44, dw = 30;
    // bottom flange, drum, top flange
    s += '<rect x="' + (cx - fw / 2) + '" y="' + (gy - 6) + '" width="' + fw + '" height="6" rx="2" fill="url(#a2-roof)"/>';
    s += '<rect x="' + (cx - dw / 2) + '" y="' + (top + 6) + '" width="' + dw + '" height="' + (gy - 12 - top) + '" fill="url(#a2-tank)"/>';
    // copper windings with windows between them
    for (var yy = top + 9; yy < gy - 8; yy += 3) s += '<path d="M' + (cx - dw / 2) + ' ' + yy + ' H' + (cx + dw / 2) + '" stroke="' + (lit ? '#d9935a' : '#6b4a33') + '" stroke-width="1.6" opacity=".95"/>';
    s += '<rect x="' + (cx - 11) + '" y="' + (top + 16) + '" width="22" height="7" fill="#0f1f38"/>';
    s += '<rect x="' + (cx - 11) + '" y="' + (top + 30) + '" width="22" height="7" fill="#0f1f38"/>';
    for (var i = 0; i < 3; i++) { s += win(cx - 9 + i * 7, top + 17.5, 4, 4, lit, .95); s += win(cx - 9 + i * 7, top + 31.5, 4, 4, lit && i !== 1, .85); }
    s += '<rect x="' + (cx - fw / 2) + '" y="' + top + '" width="' + fw + '" height="6" rx="2" fill="url(#a2-roof)"/>';
    s += '<path d="M' + (cx - fw / 2 + 1) + ' ' + (top + .5) + ' H' + (cx + fw / 2 - 1) + '" stroke="#bfe0ff" stroke-width=".9" opacity=".7"/>';
    // axle hub on top + a loose wire end running to the ground
    s += '<rect x="' + (cx - 4) + '" y="' + (top - 4) + '" width="8" height="4" rx="1" fill="#9cb3d2"/>';
    s += '<path d="M' + (cx + dw / 2) + ' ' + (gy - 16) + ' q8 2 9 16" stroke="#e0a066" stroke-width="1.3" fill="none"/>';
    return s;
  };

  // 3. Fuel Refinery: a great fuel-drop-shaped tank, with a flare stack and a tanker truck.
  FAC.fuel = function (x, gy, lit) {
    var s = '', cx = x + 18, tip = gy - 70, r = 17;
    // flare stack behind
    s += '<rect x="' + (x + 40) + '" y="' + (gy - 84) + '" width="3" height="84" fill="#3d5f8f"/>';
    for (var k = 0; k < 6; k++) s += '<path d="M' + (x + 39) + ' ' + (gy - 80 + k * 13) + ' l5 6 m-5 0 l5 -6" stroke="#2a4670" stroke-width=".7"/>';
    if (lit) s += '<ellipse cx="' + (x + 41.5) + '" cy="' + (gy - 90) + '" rx="7" ry="9" fill="url(#a2-glow)"/><path d="M' + (x + 39.5) + ' ' + (gy - 84) + ' q2 -10 2 -12 q1 5 2 12 z" fill="url(#a2-flame)"/>';
    // the drop
    var d = 'M' + cx + ' ' + tip + ' C' + (cx + 1) + ' ' + (tip + 6) + ' ' + (cx + r + 7) + ' ' + (gy - 38) + ' ' + (cx + r) + ' ' + (gy - 20) +
      ' A' + r + ' ' + r + ' 0 0 1 ' + (cx - r) + ' ' + (gy - 20) + ' C' + (cx - r - 7) + ' ' + (gy - 38) + ' ' + (cx - 1) + ' ' + (tip + 6) + ' ' + cx + ' ' + tip + ' Z';
    s += '<path d="' + d + '" fill="url(#a2-tank)"/>';
    s += '<path d="M' + cx + ' ' + tip + ' C' + (cx - 1) + ' ' + (tip + 6) + ' ' + (cx - r - 7) + ' ' + (gy - 38) + ' ' + (cx - r) + ' ' + (gy - 20) + '" fill="none" stroke="#bfe0ff" stroke-width=".9" opacity=".6"/>';
    // steel bands following the curve, an orange band, portholes
    s += '<path d="M' + (cx - 13) + ' ' + (gy - 36) + ' Q' + cx + ' ' + (gy - 32) + ' ' + (cx + 13) + ' ' + (gy - 36) + '" stroke="#16304f" stroke-width="1.6" fill="none"/>';
    s += '<path d="M' + (cx - 16.5) + ' ' + (gy - 18) + ' Q' + cx + ' ' + (gy - 13) + ' ' + (cx + 16.5) + ' ' + (gy - 18) + '" stroke="#ff8a3d" stroke-width="2" fill="none" opacity=".9"/>';
    s += '<circle cx="' + (cx - 6) + '" cy="' + (gy - 26) + '" r="2.4" fill="' + (lit ? 'url(#a2-win)' : '#0d1b31') + '"/><circle cx="' + (cx + 4) + '" cy="' + (gy - 27) + '" r="2.4" fill="' + (lit ? 'url(#a2-win)' : '#0d1b31') + '"/>';
    s += '<circle cx="' + cx + '" cy="' + (tip + 2) + '" r="1.6" fill="' + (lit ? '#ff8a3d' : '#33435e') + '"/>';
    // pipe from the drop to the flare stack
    s += '<path d="M' + (cx + r - 2) + ' ' + (gy - 12) + ' H' + (x + 40) + '" stroke="#5d84b8" stroke-width="2.4"/>';
    // tanker truck in front
    var tx = x - 6, ty = gy - 9;
    s += '<rect x="' + tx + '" y="' + ty + '" width="17" height="7" rx="3.5" fill="url(#a2-tank)"/><rect x="' + (tx + 17.5) + '" y="' + (ty + 1.5) + '" width="6" height="5.5" rx="1" fill="#5a80b4"/>';
    s += '<rect x="' + (tx + 19.5) + '" y="' + (ty + 2.5) + '" width="2.6" height="2" fill="' + (lit ? '#ffe2bd' : '#0d1b31') + '"/>';
    s += '<circle cx="' + (tx + 4) + '" cy="' + (gy - 1.4) + '" r="1.5" fill="#0b1628"/><circle cx="' + (tx + 13) + '" cy="' + (gy - 1.4) + '" r="1.5" fill="#0b1628"/><circle cx="' + (tx + 20.5) + '" cy="' + (gy - 1.4) + '" r="1.5" fill="#0b1628"/>';
    s += '<rect x="' + (tx + 2) + '" y="' + (ty + 2.6) + '" width="13" height="1.2" fill="#ff8a3d" opacity=".9"/>';
    return s;
  };

  // 4. Hull Foundry: a rocket hull section lying on its cradle, molten glow inside the open end.
  FAC.hull = function (x, gy, lit) {
    var s = '', top = gy - 44, len = 52, h = 34, cy = top + h / 2;
    // chimney behind
    s += '<rect x="' + (x + 30) + '" y="' + (top - 34) + '" width="8" height="40" fill="#24406a"/><rect x="' + (x + 29) + '" y="' + (top - 34) + '" width="10" height="3" fill="#3d5f8f"/>';
    if (lit) s += smoke(x + 34, top - 36, 1.1);
    // cradle
    s += '<path d="M' + (x + 10) + ' ' + gy + ' l4 -10 h8 l4 10 M' + (x + 36) + ' ' + gy + ' l4 -10 h8 l4 10" fill="#2d4b77"/>';
    // hull body: a horizontal cylinder (shaded top to bottom)
    s += '<rect x="' + (x + 6) + '" y="' + top + '" width="' + len + '" height="' + h + '" fill="url(#a2-hullv)"/>';
    // ribs
    for (var k = 1; k < 5; k++) s += '<rect x="' + (x + 6 + k * len / 5 - 1) + '" y="' + top + '" width="2" height="' + h + '" fill="#8ea3c2" opacity=".55"/>';
    s += '<rect x="' + (x + 6 + len * .62) + '" y="' + top + '" width="4" height="' + h + '" fill="url(#a2-orngv)"/>';
    // portholes = windows
    for (var i = 0; i < 4; i++) s += '<circle cx="' + (x + 14 + i * 11) + '" cy="' + (cy - 5) + '" r="2.2" fill="' + (lit && i !== 1 ? 'url(#a2-win)' : '#0d1b31') + '" stroke="#5d7496" stroke-width=".6"/>';
    // closed far end (right) and open near end (left) with molten glow
    s += '<ellipse cx="' + (x + 6 + len) + '" cy="' + cy + '" rx="5" ry="' + (h / 2) + '" fill="#c9d6e8" stroke="#5d7496" stroke-width=".6"/>';
    s += '<ellipse cx="' + (x + 6) + '" cy="' + cy + '" rx="5.5" ry="' + (h / 2) + '" fill="#0b1628" stroke="#9cb3d2" stroke-width="1.2"/>';
    if (lit) s += '<ellipse cx="' + (x + 6) + '" cy="' + (cy + 2) + '" rx="4" ry="' + (h / 2 - 4) + '" fill="url(#a2-furnace)"/><ellipse cx="' + (x + 6) + '" cy="' + gy + '" rx="18" ry="3.5" fill="#ff8a3d" opacity=".28" filter="url(#a2-blur-s)"/>';
    s += '<path d="M' + (x + 6) + ' ' + top + ' H' + (x + 6 + len) + '" stroke="#ffffff" stroke-width=".8" opacity=".6"/>';
    return s;
  };

  // 5. Engine Works: a giant rocket engine — combustion chamber on top, bell nozzle down to the ground.
  FAC.engine = function (x, gy, lit) {
    var s = '', cx = x + 24, top = gy - 62;
    // turbopump pipes + chamber
    s += '<path d="M' + (cx - 12) + ' ' + (top + 8) + ' q-6 6 0 14 M' + (cx + 12) + ' ' + (top + 8) + ' q6 6 0 14" stroke="#5d84b8" stroke-width="2.2" fill="none"/>';
    s += '<rect x="' + (cx - 10) + '" y="' + top + '" width="20" height="18" rx="4" fill="url(#a2-hull-d)"/>';
    s += '<rect x="' + (cx - 12) + '" y="' + (top + 3) + '" width="24" height="3" rx="1" fill="#5a80b4"/>';
    s += win(cx - 6, top + 9, 4, 4, lit, .95) + win(cx + 2, top + 9, 4, 4, lit, .8);
    // throat + bell
    var bell = 'M' + (cx - 7) + ' ' + (top + 18) + ' C' + (cx - 8) + ' ' + (top + 30) + ' ' + (cx - 24) + ' ' + (gy - 14) + ' ' + (cx - 26) + ' ' + gy +
      ' H' + (cx + 26) + ' C' + (cx + 24) + ' ' + (gy - 14) + ' ' + (cx + 8) + ' ' + (top + 30) + ' ' + (cx + 7) + ' ' + (top + 18) + ' Z';
    s += '<path d="' + bell + '" fill="url(#a2-bell)"/>';
    // cooling tubes running down the bell
    for (var k = -3; k <= 3; k++) s += '<path d="M' + (cx + k * 2) + ' ' + (top + 19) + ' C' + (cx + k * 2.2) + ' ' + (top + 32) + ' ' + (cx + k * 6) + ' ' + (gy - 12) + ' ' + (cx + k * 7.4) + ' ' + gy + '" stroke="#1b2232" stroke-width=".5" opacity=".7" fill="none"/>';
    // windows ringed around the bell
    s += win(cx - 14, gy - 18, 4, 4, lit, .9) + win(cx - 6, gy - 20, 4, 4, lit, .8) + win(cx + 2, gy - 20, 4, 4, lit && false, .8) + win(cx + 10, gy - 18, 4, 4, lit, .9);
    // the mouth of the nozzle is the hangar door, glowing like exhaust
    s += '<path d="M' + (cx - 10) + ' ' + gy + ' V' + (gy - 8) + ' a10 6 0 0 1 20 0 V' + gy + ' Z" fill="#0b1628"/>';
    if (lit) s += '<path d="M' + (cx - 8) + ' ' + gy + ' V' + (gy - 7) + ' a8 5 0 0 1 16 0 V' + gy + ' Z" fill="url(#a2-furnace)"/><ellipse cx="' + cx + '" cy="' + gy + '" rx="26" ry="4" fill="#ff8a3d" opacity=".3" filter="url(#a2-blur-s)"/>';
    s += '<path d="M' + (cx - 26) + ' ' + gy + ' H' + (cx + 26) + '" stroke="#ff8a3d" stroke-width="1.4" opacity=".8"/>';
    return s;
  };

  // 6. Avionics Lab: a giant microchip raised on a lattice mast.
  FAC.avionics = function (x, gy, lit) {
    var s = '', cx = x + 14, cw = 34, ch = 28, ct = gy - 104, cl = cx - cw / 2;
    // mast
    s += '<path d="M' + (cx - 6) + ' ' + gy + ' L' + (cx - 4) + ' ' + (ct + ch) + ' M' + (cx + 6) + ' ' + gy + ' L' + (cx + 4) + ' ' + (ct + ch) + '" stroke="#5d84b8" stroke-width="1.4"/>';
    for (var yy = ct + ch + 4; yy < gy - 4; yy += 9) s += '<path d="M' + (cx - 5.5) + ' ' + yy + ' L' + (cx + 5.5) + ' ' + (yy + 9) + ' M' + (cx + 5.5) + ' ' + yy + ' L' + (cx - 5.5) + ' ' + (yy + 9) + '" stroke="#3d6296" stroke-width=".6"/>';
    // pins on all four sides
    for (var i = 0; i < 5; i++) {
      var py = ct + 4 + i * 5, px = cl + 5 + i * 6;
      s += '<rect x="' + (cl - 4) + '" y="' + py + '" width="4" height="2" fill="#c9d6e8"/><rect x="' + (cl + cw) + '" y="' + py + '" width="4" height="2" fill="#c9d6e8"/>';
      s += '<rect x="' + px + '" y="' + (ct - 4) + '" width="2" height="4" fill="#c9d6e8"/><rect x="' + px + '" y="' + (ct + ch) + '" width="2" height="4" fill="#c9d6e8"/>';
    }
    // chip body + die
    s += '<rect x="' + cl + '" y="' + ct + '" width="' + cw + '" height="' + ch + '" rx="2.5" fill="#15233a" stroke="#4f78ad" stroke-width="1"/>';
    s += '<path d="M' + cl + ' ' + (ct + .6) + ' H' + (cl + cw) + '" stroke="#bfe0ff" stroke-width=".8" opacity=".6"/>';
    s += '<rect x="' + (cx - 8) + '" y="' + (ct + 6) + '" width="16" height="16" rx="1.5" fill="' + (lit ? '#2a4f82' : '#1a2b46') + '" stroke="#6f9ad0" stroke-width=".7"/>';
    // glowing circuit traces = the windows of the lab
    var tc = lit ? '#8fe0ff' : '#2b4670';
    s += '<path d="M' + (cl + 2) + ' ' + (ct + 8) + ' h6 v6 h4 M' + (cl + cw - 2) + ' ' + (ct + 20) + ' h-6 v-4 h-4 M' + (cl + 4) + ' ' + (ct + 24) + ' h8" stroke="' + tc + '" stroke-width=".8" fill="none"/>';
    if (lit) { s += '<rect x="' + (cx - 5) + '" y="' + (ct + 9) + '" width="10" height="10" rx="1" fill="url(#a2-win)" opacity=".85"/><rect x="' + (cx - 10) + '" y="' + (ct - 2) + '" width="20" height="32" fill="url(#a2-glow)" opacity=".25"/>'; }
    s += '<circle cx="' + (cl + 4) + '" cy="' + (ct + 4) + '" r="1.2" fill="' + (lit ? '#ff8a3d' : '#33435e') + '"/>';
    // antenna on top
    s += '<path d="M' + (cx + 10) + ' ' + (ct - 4) + ' V' + (ct - 14) + '" stroke="#7fa6d8" stroke-width="1"/><circle cx="' + (cx + 10) + '" cy="' + (ct - 15) + '" r="1.7" fill="' + (lit ? '#ff8a3d' : '#33435e') + '"/>';
    return s;
  };

  // 7. Heat Shield Kiln: a heat-shield dome tiled in black hexagons, glowing hot at the seams.
  FAC.kiln = function (x, gy, lit) {
    var s = '', cx = x + 18, rx = 17, ry = 18, id = 'kc' + Math.round(x * 10);
    var dome = 'M' + (cx - rx) + ' ' + gy + ' A' + rx + ' ' + ry + ' 0 0 1 ' + (cx + rx) + ' ' + gy + ' Z';
    s += '<clipPath id="' + id + '"><path d="' + dome + '"/></clipPath>';
    s += '<path d="' + dome + '" fill="' + (lit ? '#ff8a3d' : '#1b2a44') + '"/>';
    s += '<g clip-path="url(#' + id + ')">';
    for (var row = 0; row < 7; row++) for (var col = -1; col < 9; col++) {
      var hx = cx - rx + col * 5.2 + (row % 2 ? 2.6 : 0), hy = gy - 2 - row * 4.5;
      s += hex(hx, hy, 2.55, '#141c2b');
    }
    s += '</g>';
    s += '<path d="M' + (cx - rx) + ' ' + gy + ' A' + rx + ' ' + ry + ' 0 0 1 ' + (cx + rx) + ' ' + gy + '" fill="none" stroke="#9cc3ee" stroke-width=".9" opacity=".55"/>';
    // a glowing kiln door and a vent cap on top
    s += '<path d="M' + (cx - 4) + ' ' + gy + ' V' + (gy - 7) + ' a4 4 0 0 1 8 0 V' + gy + ' Z" fill="#0b1628"/>';
    if (lit) s += '<path d="M' + (cx - 3) + ' ' + gy + ' V' + (gy - 6.5) + ' a3 3 0 0 1 6 0 V' + gy + ' Z" fill="url(#a2-furnace)"/><ellipse cx="' + cx + '" cy="' + (gy - 10) + '" rx="24" ry="14" fill="url(#a2-glow)" opacity=".35"/>';
    s += '<rect x="' + (cx - 2) + '" y="' + (gy - ry - 6) + '" width="4" height="7" fill="#24406a"/>';
    if (lit) s += smoke(cx, gy - ry - 7, .6);
    return s;
  };

  D.factory = function (id, x, gy, lit) {
    var s = FAC[id](x, gy, lit);
    // Not owned yet: drawn as a dashed blueprint outline (style it with .fac2.ghost in CSS).
    return '<g class="fac2' + (lit ? ' lit' : ' ghost') + '" data-fac="' + id + '">' + s + '</g>';
  };

  // ---------- Rocket ----------
  // Built from the bottom: 0 = nothing, 1 = engines, 2 = + fuel tank, 3 = + guidance, 4 = + capsule.
  // x, y = top-left of a 50 x 200 box.
  D.rocket = function (x, y, built, opts) {
    opts = opts || {};
    var s = '<g transform="translate(' + x + ' ' + y + ')">';
    var outline = 'M25 0 C37 14 41 32 41 50 L41 180 L9 180 L9 50 C9 32 13 14 25 0 Z';
    s += '<path d="' + outline + '" fill="none" stroke="#9cc3ee" stroke-opacity=".5" stroke-width="1.2" stroke-dasharray="4 4"/>';
    s += '<path d="M9 150 L-3 182 V192 L9 186 M41 150 L53 182 V192 L41 186" fill="none" stroke="#9cc3ee" stroke-opacity=".4" stroke-width="1.1" stroke-dasharray="3 3"/>';
    // 1 engines: engine section, fins, three bells
    if (built >= 1) {
      s += '<path d="M9 150 L-3 182 V192 L9 186 Z" fill="url(#a2-fin)"/><path d="M41 150 L53 182 V192 L41 186 Z" fill="url(#a2-fin)"/>';
      s += '<path d="M23 160 L25 196 L27 160 Z" fill="#3d5f8f"/>';
      s += '<rect x="9" y="166" width="32" height="18" fill="url(#a2-hull-d)"/>';
      s += '<path d="M9 172 H41" stroke="#0f1a2c" stroke-width="1"/>';
      for (var rv = 0; rv < 7; rv++) s += '<circle cx="' + (11.5 + rv * 4.5) + '" cy="169" r=".55" fill="#9cb3d2"/>';
      s += '<path d="M12 184 h7 l2 10 h-11 z M21.5 184 h7 l2 12 h-11 z M31 184 h7 l2 10 h-11 z" fill="url(#a2-bell)"/>';
      s += '<path d="M10 194 h11 M19.5 196 h11 M29 194 h11" stroke="#ff8a3d" stroke-width="1" opacity=".75"/>';
    }
    // 2 fuel tank: long first stage with seams, rivets, logo stripe
    if (built >= 2) {
      s += '<rect x="9" y="96" width="32" height="70" fill="url(#a2-hull)"/>';
      s += '<path d="M9 112 H41 M9 130 H41 M9 148 H41" stroke="#8ea3c2" stroke-width=".6"/>';
      s += '<path d="M25 96 V166" stroke="#8ea3c2" stroke-width=".4" opacity=".6"/>';
      s += '<rect x="9" y="138" width="32" height="4" fill="url(#a2-orng)"/>';
      s += '<rect x="9" y="143" width="32" height="1.5" fill="#1c2b45"/>';
      s += '<text x="17.5" y="120" transform="rotate(90 17.5 120)" font-family="Unbounded, sans-serif" font-size="5.2" font-weight="500" fill="#2a3f62" letter-spacing=".6">STARWRIGHT</text>';
      // grid fins
      s += '<path d="M6 100 h3 v7 h-3 z M41 100 h3 v7 h-3 z" fill="none" stroke="#5d7496" stroke-width=".8"/><path d="M6 103.5 h3 M41 103.5 h3" stroke="#5d7496" stroke-width=".6"/>';
    }
    // 3 guidance: interstage + upper stage with portholes
    if (built >= 3) {
      s += '<rect x="9" y="90" width="32" height="6" fill="url(#a2-hull-d)"/>';
      for (var rv2 = 0; rv2 < 7; rv2++) s += '<circle cx="' + (11.5 + rv2 * 4.5) + '" cy="93" r=".55" fill="#9cb3d2"/>';
      s += '<path d="M9 50 L41 50 L41 90 L9 90 Z" fill="url(#a2-hull)"/>';
      s += '<path d="M9 70 H41" stroke="#8ea3c2" stroke-width=".6"/>';
      s += '<circle cx="25" cy="62" r="4.6" fill="#0b1426" stroke="#5d7496" stroke-width="1.6"/><path d="M22.5 60 a3 3 0 0 1 3.5 -1.6" stroke="#9cc3ee" stroke-width="1" fill="none"/>';
      s += '<rect x="9" y="80" width="32" height="2.2" fill="url(#a2-orng)"/>';
      s += '<rect x="6.5" y="74" width="2.5" height="5" rx=".8" fill="#5d7496"/><rect x="41" y="74" width="2.5" height="5" rx=".8" fill="#5d7496"/>';
    }
    // 4 capsule: ogive fairing with orange tip and seams
    if (built >= 4) {
      s += '<path d="M25 0 C37 14 41 32 41 50 L9 50 C9 32 13 14 25 0 Z" fill="url(#a2-hull)"/>';
      s += '<path d="M25 0 C30 6 33 11 35 17 L15 17 C17 11 20 6 25 0 Z" fill="url(#a2-orng)"/>';
      s += '<path d="M25 17 V50" stroke="#8ea3c2" stroke-width=".5"/><path d="M11.5 36 H38.5" stroke="#8ea3c2" stroke-width=".5"/>';
      s += '<path d="M15 44 h4 M31 44 h4" stroke="#1c2b45" stroke-width="1.4"/>';
    }
    // highlight shine down the lit side
    if (built >= 1) s += '<rect x="19" y="' + [0, 166, 96, 50, 4][built] + '" width="2.2" height="' + (180 - [0, 166, 96, 50, 4][built]) + '" fill="#fff" opacity=".35"/>';
    if (opts.vapor) s += '<g filter="url(#a2-blur)"><ellipse cx="2" cy="200" rx="16" ry="7" fill="#eef3fb" opacity=".35"/><ellipse cx="46" cy="202" rx="18" ry="7" fill="#eef3fb" opacity=".3"/></g>';
    s += '</g>';
    return s;
  };

  // ---------- Gantry ----------
  D.gantry = function (x, top, gy, built) {
    var s = '<g class="gantry2">', w = 16;
    s += '<path d="M' + x + ' ' + gy + ' V' + top + ' M' + (x + w) + ' ' + gy + ' V' + top + '" stroke="#6d93c6" stroke-width="1.6"/>';
    for (var yy = top + 4; yy < gy - 4; yy += 12) s += '<path d="M' + x + ' ' + yy + ' L' + (x + w) + ' ' + (yy + 12) + ' M' + (x + w) + ' ' + yy + ' L' + x + ' ' + (yy + 12) + '" stroke="#4a6e9f" stroke-width=".8"/>';
    for (var p = top + 30; p < gy - 10; p += 42) s += '<path d="M' + (x - 4) + ' ' + p + ' H' + (x + w + 6) + '" stroke="#8fb4e4" stroke-width="1.6"/><path d="M' + (x - 4) + ' ' + (p - 5) + ' H' + (x + w + 6) + '" stroke="#5d84b8" stroke-width=".6"/>';
    // crane jib on top
    s += '<path d="M' + (x - 10) + ' ' + (top - 2) + ' H' + (x + w + 18) + ' M' + (x + w / 2) + ' ' + top + ' V' + (top - 10) + ' L' + (x - 10) + ' ' + (top - 2) + ' M' + (x + w / 2) + ' ' + (top - 10) + ' L' + (x + w + 18) + ' ' + (top - 2) + '" stroke="#6d93c6" stroke-width="1.1" fill="none"/>';
    s += '<path d="M' + (x + w + 16) + ' ' + (top - 2) + ' V' + (top + 14) + '" stroke="#9cc3ee" stroke-width=".6"/>';
    // service arms reach the rocket's built sections
    var arms = [[gy - 40, 1], [gy - 110, 2], [gy - 150, 3]];
    arms.forEach(function (a) {
      if (built >= a[1]) s += '<path d="M' + (x + w) + ' ' + a[0] + ' H' + (x + w + 13) + '" stroke="#8fb4e4" stroke-width="2.2"/><path d="M' + (x + w + 4) + ' ' + (a[0] + 1) + ' q4 8 9 7" stroke="#c98a4e" stroke-width=".9" fill="none"/>';
    });
    // beacons
    s += '<circle cx="' + (x + w / 2) + '" cy="' + (top - 11) + '" r="2" fill="#ff8a3d"/><circle cx="' + (x + w / 2) + '" cy="' + (top - 11) + '" r="6" fill="#ff8a3d" opacity=".25"/>';
    s += '<circle cx="' + (x - 10) + '" cy="' + (top - 2) + '" r="1.4" fill="#ff8a3d"/>';
    s += '</g>';
    return s;
  };

  // Light pole with a warm glow.
  function pole(x, gy, h) {
    return '<path d="M' + x + ' ' + gy + ' V' + (gy - h) + ' h4" stroke="#4f78ad" stroke-width="1"/><circle cx="' + (x + 4) + '" cy="' + (gy - h + 1) + '" r="1.5" fill="#ffe2bd"/><circle cx="' + (x + 4) + '" cy="' + (gy - h + 1) + '" r="7" fill="url(#a2-glow)"/>';
  }

  // ---------- The whole dusk yard ----------
  // owned: array of 8 booleans (factories in order). built: rocket sections 0-4.
  D.yard = function (W, H, owned, built, opts) {
    opts = opts || {};
    var r = rnd(11), gy = 356;
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMax slice" aria-hidden="true">';
    s += '<defs><linearGradient id="a2-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#060c1c"/><stop offset=".3" stop-color="#12284e"/><stop offset=".5" stop-color="#36609a"/><stop offset=".6" stop-color="#93adcc"/><stop offset=".68" stop-color="#f1b088"/><stop offset=".75" stop-color="#ff8a4a"/><stop offset="1" stop-color="#ff8a4a"/></linearGradient>' +
      '<linearGradient id="a2-far" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#456a9e"/><stop offset="1" stop-color="#2d4c7c"/></linearGradient>' +
      '<linearGradient id="a2-mid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#21406b"/><stop offset="1" stop-color="#18304f"/></linearGradient>' +
      '<linearGradient id="a2-ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#132440"/><stop offset="1" stop-color="#0a1426"/></linearGradient></defs>';
    s += '<rect width="' + W + '" height="' + H + '" fill="url(#a2-sky)"/>';
    s += '<g fill="#fff">';
    for (var i = 0; i < 80; i++) { var y = r() * 180; s += '<circle cx="' + f(r() * W) + '" cy="' + f(y) + '" r="' + (r() * .9 + .25).toFixed(2) + '" opacity="' + ((1 - y / 200) * (r() * .6 + .3)).toFixed(2) + '"/>'; }
    s += '</g>';
    // moon + station
    s += '<circle cx="196" cy="112" r="42" fill="url(#a2-glow)" opacity=".7"/><circle cx="196" cy="112" r="14" fill="#f3f6fb"/><circle cx="191" cy="108" r="3" fill="#c9d3e2"/><circle cx="200" cy="117" r="2" fill="#d3dbe7"/><circle cx="194" cy="118" r="1.2" fill="#d3dbe7"/>';
    if (opts.moonLight) s += '<circle class="moonlight on" cx="200" cy="117" r="1.7" fill="#ff8a3d"/>';
    if (opts.marsDot) s += '<circle cx="64" cy="62" r="2.4" fill="#e0703a"/><circle cx="64" cy="62" r="6" fill="#e0703a" opacity=".25"/>';
    if (opts.station) s += '<g transform="translate(250 150)"><rect x="-3" y="-2" width="6" height="4" rx="1" fill="#e8eef8"/><rect x="-14" y="-4" width="9" height="8" fill="#2a4f82" stroke="#bcd5f2" stroke-width=".6"/><rect x="5" y="-4" width="9" height="8" fill="#2a4f82" stroke="#bcd5f2" stroke-width=".6"/><circle r="1" fill="#ff8a3d"/></g>';
    // hills
    s += '<path d="M0 300 L36 286 L70 293 L118 270 L160 285 L212 262 L262 283 L308 268 L350 280 L390 270 V' + H + ' H0 Z" fill="url(#a2-far)" opacity=".85"/>';
    s += '<g fill="#ffd9b8" opacity=".5">'; for (var c = 0; c < 26; c++) s += '<rect x="' + f(r() * W) + '" y="' + f(300 + r() * 12) + '" width="1.2" height="1.2"/>'; s += '</g>';
    s += '<path d="M0 322 C60 306 110 316 170 306 C230 296 290 310 390 302 V' + H + ' H0 Z" fill="url(#a2-mid)"/>';
    // floodlight beams onto the pad
    s += '<polygon points="306,190 262,' + gy + ' 368,' + gy + '" fill="url(#a2-beam)" opacity=".55"/>';
    // back layer: avionics tower behind the foundry
    s += D.factory('avionics', 210, gy, owned[5]);
    // factories, left to right
    s += D.factory('bolt', 4, gy, owned[0]);
    s += D.factory('wire', 66, gy, owned[1]);
    s += D.factory('fuel', 116, gy, owned[2]);
    s += D.factory('hull', 166, gy, owned[3]);
    s += D.factory('engine', 224, gy, owned[4]);
    s += D.factory('kiln', 268, gy, owned[6]);
    // pipes, poles, fence
    s += '<path d="M62 346 H68 M112 340 H118 M162 344 H168 M226 348 H232" stroke="#4f78ad" stroke-width="3" stroke-linecap="round"/>';
    s += pole(60, gy, 26) + pole(160, gy, 30) + pole(296, gy, 22);
    // gantry + rocket
    s += '<g class="fac2' + (owned[7] ? ' lit' : ' ghost') + '">' + D.gantry(306, 150, gy, built) + '</g>';
    // rocket (with a hidden exhaust flame that shows during a launch)
    s += '<g id="rk2"><g id="rk2-flame"><ellipse cx="351" cy="' + (gy + 6) + '" rx="26" ry="16" fill="url(#a2-glow)"/>' +
      '<path d="M337 ' + (gy - 6) + ' Q351 ' + (gy + 70) + ' 365 ' + (gy - 6) + ' Z" fill="url(#a2-flame)"/>' +
      '<path d="M344 ' + (gy - 6) + ' Q351 ' + (gy + 34) + ' 358 ' + (gy - 6) + ' Z" fill="#fff4dc" opacity=".9"/></g>' +
      D.rocket(326, gy - 200, built, { vapor: built >= 4 }) + '</g>';
    // ground
    s += '<path d="M0 ' + (gy - 2) + ' C90 ' + (gy - 4) + ' 220 ' + (gy - 1) + ' 390 ' + (gy - 4) + ' V' + H + ' H0 Z" fill="url(#a2-ground)"/>';
    s += '<path d="M0 ' + (gy + 8) + ' H390" stroke="#2b4670" stroke-width=".8" stroke-dasharray="6 5" opacity=".7"/>';
    s += '<ellipse cx="351" cy="' + gy + '" rx="42" ry="4" fill="#ffd9b8" opacity=".2"/>';
    s += '<ellipse cx="196" cy="' + (gy + 2) + '" rx="40" ry="3" fill="#ff8a3d" opacity=".12"/>';
    // Ori
    if (opts.ori !== false) s += '<use href="#sym-ori" x="300" y="' + (gy - 33) + '" width="23" height="32"/>';
    s += '</svg>';
    return s;
  };

  // ---------- Two-tone factory icons (32x32) ----------
  var ICON = {
    bolt: '<path d="M16 3 l10 6 v12 l-10 6 l-10 -6 v-12 z" fill="#d8e9ff"/><path d="M16 3 l10 6 l-10 6 l-10 -6 z" fill="#ffffff"/><circle cx="16" cy="15" r="4.2" fill="#2a4f82"/><path d="M13.5 13 l5 4 M13.5 17 l5 -4" stroke="#9cc3ee" stroke-width="1"/>',
    wire: '<rect x="7" y="5" width="18" height="22" rx="3" fill="#d8e9ff"/><rect x="5" y="5" width="22" height="3.5" rx="1.5" fill="#ffffff"/><rect x="5" y="23.5" width="22" height="3.5" rx="1.5" fill="#ffffff"/><path d="M8 11 h16 M8 14 h16 M8 17 h16 M8 20 h16" stroke="#c98a4e" stroke-width="2"/>',
    fuel: '<rect x="8" y="6" width="16" height="22" rx="6" fill="#d8e9ff"/><rect x="8" y="12" width="16" height="2.5" fill="#2a4f82"/><rect x="8" y="20" width="16" height="2.5" fill="#2a4f82"/><path d="M16 3 q-3 4 0 6 q3 -2 0 -6" fill="#ff8a3d"/><rect x="11" y="8" width="2" height="18" rx="1" fill="#ffffff" opacity=".7"/>',
    hull: '<path d="M4 12 h24 v14 h-24 z" fill="#d8e9ff"/><path d="M4 12 l4 -6 h16 l4 6 z" fill="#ffffff"/><path d="M12 26 v-7 a4 4 0 0 1 8 0 v7 z" fill="#ff8a3d"/><rect x="22" y="2" width="4" height="10" fill="#9cc3ee"/>',
    engine: '<rect x="11" y="3" width="10" height="9" rx="2" fill="#ffffff"/><path d="M10 12 h12 l4 14 h-20 z" fill="#d8e9ff"/><path d="M6 26 h20" stroke="#ff8a3d" stroke-width="2.4" stroke-linecap="round"/><path d="M13 14 l-2 10 M19 14 l2 10" stroke="#2a4f82" stroke-width="1"/>',
    chip: '<rect x="7" y="7" width="18" height="18" rx="3" fill="#d8e9ff"/><rect x="11" y="11" width="10" height="10" rx="1.5" fill="#2a4f82"/><circle cx="16" cy="16" r="2" fill="#ff8a3d"/><path d="M11 3 v4 M16 3 v4 M21 3 v4 M11 25 v4 M16 25 v4 M21 25 v4 M3 11 h4 M3 16 h4 M3 21 h4 M25 11 h4 M25 16 h4 M25 21 h4" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round"/>',
    kiln: '<path d="M16 3 l11 5 v8 c0 6 -5 10.5 -11 13 c-6 -2.5 -11 -7 -11 -13 v-8 z" fill="#d8e9ff"/><path d="M16 3 l11 5 v8 c0 6 -5 10.5 -11 13 z" fill="#ffffff" opacity=".6"/><path d="M11 17 h10 M12 21 h8" stroke="#ff8a3d" stroke-width="2" stroke-linecap="round"/>',
    tower: '<path d="M9 29 V4 M19 29 V4" stroke="#ffffff" stroke-width="2"/><path d="M9 7 l10 5 l-10 5 l10 5 l-10 5" stroke="#d8e9ff" stroke-width="1.4" fill="none"/><path d="M22 10 c4 4 5 9 5 14 v5 h-6 v-5 c0 -5 0 -10 1 -14 z" fill="#ff8a3d"/>'
  };
  D.icon = function (id, size) {
    size = size || 26;
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 32 32" aria-hidden="true">' + (ICON[id] || '') + '</svg>';
  };
})(typeof window !== 'undefined' ? window : globalThis);

/*
 * Era VI: Kestrel, and the endless mode after it ("The Long Way").
 * Kestrel opens at CONFIG.kestrel.unlockColonists. After that, every expedition that lands at least
 * one new colonist delivers the next of 12 segments; each segment adds a lasting power.
 * The last segment ends the story. Then The Long Way: reach each star system's payload goal, jump,
 * and climb in star rank (each rank multiplies income) with no cap.
 */
(function (root) {
  var SW = root.SW = root.SW || {};
  var K = SW.kestrel = {};
  function C() { return SW.CONFIG.kestrel; }

  K.fresh = function () { return { built: 0, ended: false, rank: 0, ly: 0, system: null }; };
  K.open = function (s) { return s.kestrel.built > 0 || (s.mars && s.mars.colonists >= C().unlockColonists); };
  K.complete = function (s) { return s.kestrel.built >= C().segments.length; };
  K.next = function (s) { return C().segments[s.kestrel.built] || null; };

  // Combined effect of built segments (and the current star system's bonus).
  K.effect = function (s, key, mode) {
    var v = mode === 'mul' ? 1 : 0;
    if (!s.kestrel) return v;
    C().segments.slice(0, s.kestrel.built).forEach(function (seg) {
      var e = seg.effect[key];
      if (e === undefined) return;
      v = mode === 'mul' ? v * e : v + e;
    });
    var sys = s.kestrel.system;
    if (sys && sys.bonus && sys.bonus.key === key) v = mode === 'mul' ? v * sys.bonus.value : v + sys.bonus.value;
    if (key === 'income' && s.kestrel.rank) v *= Math.pow(C().rankIncome, s.kestrel.rank);
    return v;
  };

  // Called after an expedition. Returns the segment delivered, or null.
  K.afterExpedition = function (s, colonistsGained) {
    if (!K.open(s) || K.complete(s) || !(colonistsGained > 0)) return null;
    var seg = C().segments[s.kestrel.built];
    s.kestrel.built += 1;
    return seg;
  };

  // ---------- The Long Way ----------
  var GREEK = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa', 'Lambda', 'Sigma', 'Tau', 'Omega'];
  var PART = ['Ves', 'Cor', 'Ilo', 'Tara', 'Nym', 'Quel', 'Aru', 'Sen', 'Mira', 'Oth', 'Lys', 'Dena', 'Kael', 'Vora'];
  function pick(a, r) { return a[Math.floor(r() * a.length)]; }
  function rng(seed) { return function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }; }

  K.makeSystem = function (rank) {
    var r = rng(1234 + rank * 7919);
    var twists = C().systemTwists, bonuses = C().systemBonuses;
    return {
      name: pick(GREEK, r) + ' ' + pick(PART, r) + pick(PART, r).toLowerCase(),
      distance: Math.round(4 + r() * 9),
      twist: rank === 0 ? null : pick(twists, r),
      bonus: pick(bonuses, r),
      goal: C().goalBase * Math.pow(C().goalGrowth, rank)
    };
  };
  K.startLongWay = function (s) {
    if (!K.complete(s) || s.kestrel.ended) return;
    s.kestrel.ended = true;
    s.kestrel.system = K.makeSystem(0);
  };
  K.canJump = function (s) { return !!(s.kestrel.system && s.payload >= s.kestrel.system.goal); };
  // Jump to the next star: an expedition-style reset that also raises your star rank.
  K.jump = function (s) {
    if (!K.canJump(s)) return null;
    var from = s.kestrel.system;
    var col = SW.mars.expedition(s, null, true) || 0;
    s.kestrel.rank += 1;
    s.kestrel.ly += from.distance;
    s.kestrel.system = K.makeSystem(s.kestrel.rank);
    return { from: from, to: s.kestrel.system, colonists: col };
  };
  K.systemTwist = function (s, id) { return !!(s.kestrel && s.kestrel.system && s.kestrel.system.twist === id); };
})(typeof window !== 'undefined' ? window : globalThis);

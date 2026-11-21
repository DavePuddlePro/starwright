/*
 * Era IV: the Moon base. Rigs mine Helium-3 all the time (even across launches and while you're away).
 * Spend Helium-3 on more rigs, on the Fusion Reactor (multiplies all income), or on base upgrades
 * like the Mass Driver (launches for you) and the Foreman (buys factories for you).
 */
(function (root) {
  var SW = root.SW = root.SW || {};
  var M = SW.moon = {};
  function C() { return SW.CONFIG.moon; }
  function E() { return SW.econ; }

  M.fresh = function () {
    return { started: false, he3: 0, total: 0, rigs: {}, fusion: 0, base: {}, auto: { launch: true, threshold: 50, buy: true, upgrades: true } };
  };
  M.open = function (s) { return E().hasModule(s, 'obs') && !E().twist(s, 'nomoon'); };
  M.start = function (s) {
    if (s.moon.started || !M.open(s)) return false;
    s.moon.started = true;
    s.moon.rigs[C().rigs[0].id] = 1;
    s.moon.he3 += C().startHe3;
    s.moon.base.driver = true;
    return true;
  };
  M.has = function (s, id) { return !!(s.moon && s.moon.base[id]); };

  // ---------- Rigs ----------
  M.rigCount = function (s, id) { return s.moon.rigs[id] || 0; };
  // Each Fusion level also speeds up mining a little, so the Moon keeps growing over weeks.
  M.miningMult = function (s) {
    var m = 1 + C().fusionMining * s.moon.fusion;
    if (SW.mars) m *= SW.mars.miningMult(s) * (SW.mars.perk(s, 'nomoon') ? 3 : 1);
    if (SW.kestrel) m *= SW.kestrel.effect(s, 'mining', 'mul');
    return m;
  };
  M.rigRate = function (s, r, count) { return r.rate * (count === undefined ? M.rigCount(s, r.id) : count) * M.miningMult(s); };
  M.rate = function (s) {
    if (!s.moon || !s.moon.started) return 0;
    return C().rigs.reduce(function (t, r) { return t + M.rigRate(s, r); }, 0);
  };
  M.rigCost = function (r, owned, k) { var g = r.growth; return r.cost * Math.pow(g, owned) * (Math.pow(g, k) - 1) / (g - 1); };
  M.rigById = function (id) { return C().rigs.filter(function (r) { return r.id === id; })[0]; };
  M.buyRig = function (s, id) {
    var r = M.rigById(id), c = M.rigCost(r, M.rigCount(s, id), 1);
    if (!r || s.moon.he3 < c) return false;
    s.moon.he3 -= c;
    s.moon.rigs[id] = M.rigCount(s, id) + 1;
    return true;
  };
  M.rigRevealed = function (s, r, i) { return i === 0 || M.rigCount(s, r.id) > 0 || s.moon.total >= r.cost * 0.3; };

  // ---------- Fusion Reactor ----------
  M.fusionCost = function (s) { return C().fusionBase * Math.pow(s.moon.fusion + 1, C().fusionPower); };
  M.fusionMult = function (s) { return s.moon ? Math.pow(C().fusionMult + (SW.kestrel ? SW.kestrel.effect(s, 'fusion') : 0), s.moon.fusion) : 1; };
  M.buyFusion = function (s) {
    var c = M.fusionCost(s);
    if (s.moon.he3 < c) return false;
    s.moon.he3 -= c;
    s.moon.fusion += 1;
    return true;
  };

  // ---------- Base upgrades ----------
  M.buyBase = function (s, id) {
    var b = C().base.filter(function (x) { return x.id === id; })[0];
    if (!b || s.moon.base[id] || s.moon.he3 < b.cost) return false;
    s.moon.he3 -= b.cost;
    s.moon.base[id] = true;
    return true;
  };

  // ---------- Mass Driver ----------
  // Auto-launch fires once a launch would add at least `threshold`% to your payload.
  M.autoTarget = function (s) { return Math.max(1, Math.ceil(s.payload * s.moon.auto.threshold / 100)); };
  M.autoReady = function (s) { return M.has(s, 'driver') && s.moon.auto.launch && !E().twist(s, 'manual') && E().payloadGain(s) >= M.autoTarget(s); };

  // ---------- Time ----------
  function add(s, amt) { s.moon.he3 += amt; s.moon.total += amt; }
  M.tick = function (s, dt) { if (s.moon && s.moon.started) add(s, M.rate(s) * dt); };
  M.away = function (s, seconds) {
    if (!s.moon || !s.moon.started) return 0;
    var amt = M.rate(s) * Math.min(seconds, C().awayCapHours * 3600);
    add(s, amt);
    return amt;
  };
})(typeof window !== 'undefined' ? window : globalThis);

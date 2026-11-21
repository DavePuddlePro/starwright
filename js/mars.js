/*
 * Era V: Mars. An Expedition is the second, bigger reset: it starts over Earth, payload, the station
 * and the Moon. In return you land Colonists, who multiply income (and Moon mining) for good.
 * After the first Expedition, Missions unlock: Expeditions with one twist and a payload goal.
 * Finishing a Mission gives a permanent perk.
 */
(function (root) {
  var SW = root.SW = root.SW || {};
  var R = SW.mars = {};
  function C() { return SW.CONFIG.mars; }
  function E() { return SW.econ; }

  R.fresh = function () { return { colonists: 0, expeditions: 0, done: {}, active: null }; };

  R.open = function (s) {
    return s.mars.expeditions > 0 || !!(s.moon && s.moon.started && s.moon.fusion >= C().unlockFusion);
  };

  // Colonists you'd have in total for a given payload: (log10(payload) - 3)^2, rounded down.
  R.colonistsFor = function (payload) {
    var x = Math.log10(Math.max(1, payload)) - C().colonistLogStart;
    return x > 0 ? Math.floor(x * x) : 0;
  };
  R.gain = function (s) { return Math.max(0, R.colonistsFor(s.payload) - s.mars.colonists); };
  // Payload needed for the next colonist.
  R.payloadForNext = function (s) {
    var target = s.mars.colonists + R.gain(s) + 1;
    return Math.pow(10, Math.sqrt(target) + C().colonistLogStart);
  };
  R.perColonist = function (s) { return C().incomePerColonist + (SW.kestrel ? SW.kestrel.effect(s, 'colonist') : 0); };
  R.incomeMult = function (s) { return s.mars ? Math.pow(R.perColonist(s), s.mars.colonists) : 1; };
  R.miningMult = function (s) { return s.mars ? 1 + C().miningPerColonist * s.mars.colonists : 1; };

  // ---------- Missions ----------
  R.mission = function (id) { return C().missions.filter(function (m) { return m.id === id; })[0]; };
  R.twist = function (s, id) { return !!(s.mars && s.mars.active === id) || (SW.kestrel ? SW.kestrel.systemTwist(s, id) : false); };
  R.perk = function (s, id) { return !!(s.mars && s.mars.done[id]); };
  R.checkMission = function (s) {
    var id = s.mars.active;
    if (!id) return null;
    var m = R.mission(id);
    if (s.payload < m.goal) return null;
    s.mars.done[id] = true;
    s.mars.active = null;
    return m;
  };
  R.abandon = function (s) { s.mars.active = null; };

  // ---------- The Expedition reset ----------
  // missionId (optional) starts a Mission with its twist.
  // force: a Long Way jump resets even when no colonists are gained.
  R.expedition = function (s, missionId, force) {
    var g = R.gain(s);
    if (!missionId && !force && g <= 0) return null;
    s.mars.colonists += g;
    s.mars.expeditions += 1;
    s.mars.active = missionId || null;
    var E_ = E();
    // Earth
    s.credits = SW.CONFIG.factories[0].cost;
    s.runEarned = 0; s.runTime = 0;
    s.totalEarned = 0;
    s.upgrades = {};
    s.rocket = [];
    E_.resetFactories(s);
    // Orbit and Moon
    s.payload = 0;
    s.launches = 0;
    s.modSeen = SW.CONFIG.stationModules.length; // don't re-announce every module
    var auto = s.moon ? s.moon.auto : null;
    s.moon = SW.moon.fresh();
    if (auto) s.moon.auto = auto; // remember the player's Mass Driver settings
    var hs = E_.headStart(s);
    if (hs) SW.CONFIG.factories.slice(0, 3).forEach(function (f) { s.factories[f.id].count = hs; });
    return g;
  };
})(typeof window !== 'undefined' ? window : globalThis);

/* Achievements and the Daily Supply Drop. Pure functions over the state, like economy.js. */
(function (root) {
  var SW = root.SW = root.SW || {};
  var E = SW.econ;
  var P = SW.prog = {};
  function C() { return SW.CONFIG; }

  // ---------- Achievements ----------
  // Each: id, name, desc, value(s) -> current number, goal.
  var list = null;
  P.achievements = function () {
    if (list) return list;
    list = [];
    var tiers = [[1, 'Up and running'], [25, 'Shift work'], [100, 'Full production']];
    C().factories.forEach(function (f) {
      tiers.forEach(function (t) {
        list.push({ id: 'own.' + f.id + '.' + t[0], name: f.name + ': ' + t[1], desc: t[0] === 1 ? 'Own a ' + f.name : 'Own ' + t[0] + ' ' + f.name + ' factories',
          goal: t[0], value: function (s) { return E.factoryCount(s, f.id); } });
      });
    });
    [[1e3, 'Pocket change'], [1e6, 'First million'], [1e9, 'Billionaire yard'], [1e12, 'Trillion-credit club'], [1e15, 'Quadrillions'], [1e18, 'Quintillions']].forEach(function (t) {
      list.push({ id: 'earn.' + t[0], name: t[1], desc: 'Earn ' + SW.fmt(t[0]) + ' credits in total', goal: t[0], value: function (s) { return s.totalEarned; } });
    });
    [[1e3, 'Humming along'], [1e6, 'Busy yard'], [1e9, 'Industrial power'], [1e12, 'Unstoppable']].forEach(function (t) {
      list.push({ id: 'rate.' + t[0], name: t[1], desc: 'Reach ' + SW.fmt(t[0]) + ' credits per second', goal: t[0], value: function (s) { return E.totalRate(s, { noOverdrive: true }); } });
    });
    [[1, 'Liftoff'], [5, 'Regular service'], [10, 'Launch cadence'], [25, 'Frequent flyer'], [50, 'Spaceport']].forEach(function (t) {
      list.push({ id: 'launch.' + t[0], name: t[1], desc: 'Launch ' + t[0] + ' rocket' + (t[0] > 1 ? 's' : ''), goal: t[0], value: function (s) { return s.launches; } });
    });
    [[25, 'Foothold'], [100, 'Heavy lifter'], [500, 'Orbital stockpile'], [2500, 'Sky harbor']].forEach(function (t) {
      list.push({ id: 'payload.' + t[0], name: t[1], desc: 'Have ' + t[0] + ' t of payload in orbit', goal: t[0], value: function (s) { return s.payload; } });
    });
    [[5, 'Tinkerer'], [15, 'Engineer'], [30, 'Chief engineer']].forEach(function (t) {
      list.push({ id: 'up.' + t[0], name: t[1], desc: 'Buy ' + t[0] + ' upgrades in one run', goal: t[0], value: function (s) { return Object.keys(s.upgrades).length; } });
    });
    [[3600, 'Afterburner'], [36000, 'Running hot'], [180000, 'Redline']].forEach(function (t) {
      list.push({ id: 'od.' + t[0], name: t[1], desc: 'Use ' + (t[0] / 3600) + ' hours of Overdrive', goal: t[0], value: function (s) { return s.stats.odUsed; } });
    });
    [[1, 'Spark'], [5, 'Steady burn'], [10, 'Small sun']].forEach(function (t) {
      list.push({ id: 'fusion.' + t[0], name: t[1], desc: 'Reach Fusion level ' + t[0], goal: t[0], value: function (s) { return s.moon ? s.moon.fusion : 0; } });
    });
    [[1e3, 'Moon dust'], [1e6, 'Helium rush']].forEach(function (t) {
      list.push({ id: 'he3.' + t[0], name: t[1], desc: 'Mine ' + SW.fmt(t[0]) + ' Helium-3 in total', goal: t[0], value: function (s) { return s.moon ? s.moon.total : 0; } });
    });
    [[10, 'Hands off'], [100, 'Lights-out launching']].forEach(function (t) {
      list.push({ id: 'auto.' + t[0], name: t[1], desc: 'Let the Mass Driver auto-launch ' + t[0] + ' times', goal: t[0], value: function (s) { return s.stats.autoLaunches || 0; } });
    });
    [[10, 'Settlement'], [50, 'Township'], [200, 'Red city']].forEach(function (t) {
      list.push({ id: 'col.' + t[0], name: t[1], desc: 'Have ' + t[0] + ' colonists', goal: t[0], value: function (s) { return s.mars ? s.mars.colonists : 0; } });
    });
    [[1, 'Red dust'], [5, 'Old hands']].forEach(function (t) {
      list.push({ id: 'exp.' + t[0], name: t[1], desc: 'Go on ' + t[0] + ' expedition' + (t[0] > 1 ? 's' : ''), goal: t[0], value: function (s) { return s.mars ? s.mars.expeditions : 0; } });
    });
    [[1, 'Mission accomplished'], [5, 'Every twist']].forEach(function (t) {
      list.push({ id: 'mis.' + t[0], name: t[1], desc: 'Complete ' + t[0] + ' mission' + (t[0] > 1 ? 's' : ''), goal: t[0], value: function (s) { return s.mars ? Object.keys(s.mars.done).length : 0; } });
    });
    [[1, 'First steel'], [6, 'Half a ship'], [12, 'Kestrel']].forEach(function (t) {
      list.push({ id: 'kes.' + t[0], name: t[1], desc: 'Have ' + t[0] + ' Kestrel segment' + (t[0] > 1 ? 's' : '') + ' in orbit', goal: t[0], value: function (s) { return s.kestrel ? s.kestrel.built : 0; } });
    });
    [[1, 'Out of the cradle'], [5, 'Star hopper'], [10, 'Far traveller'], [25, 'Wanderer']].forEach(function (t) {
      list.push({ id: 'rank.' + t[0], name: t[1], desc: 'Reach star rank ' + t[0], goal: t[0], value: function (s) { return s.kestrel ? s.kestrel.rank : 0; } });
    });
    [[1, 'Special delivery'], [7, 'Full week'], [30, 'Regular customer']].forEach(function (t) {
      list.push({ id: 'drop.' + t[0], name: t[1], desc: 'Open ' + t[0] + ' Supply Drop' + (t[0] > 1 ? 's' : ''), goal: t[0], value: function (s) { return s.stats.drops; } });
    });
    return list;
  };

  P.earnedCount = function (s) { return Object.keys(s.ach).length; };

  // Returns newly earned achievements (and records them).
  P.check = function (s) {
    var fresh = [];
    P.achievements().forEach(function (a) {
      if (s.ach[a.id]) return;
      if (a.value(s) >= a.goal) { s.ach[a.id] = Date.now(); fresh.push(a); }
    });
    return fresh;
  };

  // The closest unearned achievements, by progress.
  P.next = function (s, n) {
    return P.achievements().filter(function (a) { return !s.ach[a.id]; })
      .map(function (a) { return { a: a, frac: Math.min(0.999, a.value(s) / a.goal) }; })
      .sort(function (x, y) { return y.frac - x.frac; })
      .slice(0, n);
  };

  // ---------- Daily Supply Drop ----------
  function dayKey(d) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function daysBetween(a, b) {
    var pa = a.split('-'), pb = b.split('-');
    var da = new Date(+pa[0], pa[1] - 1, +pa[2]), db = new Date(+pb[0], pb[1] - 1, +pb[2]);
    return Math.round((db - da) / 86400000);
  }
  P.today = function (now) { return dayKey(new Date(now || Date.now())); };
  P.dropReady = function (s, now) { return s.daily.last !== P.today(now); };

  // Which step of the 7-day cycle you'd get if you claimed now (missing days steps back one).
  P.dropStep = function (s, now) {
    var step = s.daily.step;
    if (s.daily.last && daysBetween(s.daily.last, P.today(now)) > 1) step = Math.max(0, step - 1);
    return step;
  };
  P.dropReward = function (s, step) {
    var r = C().dailyDrops[step], rate = E.totalRate(s, { noOverdrive: true });
    return { step: step, credits: (r.income || 0) * 3600 * rate, overdrive: (r.overdrive || 0) * 3600, def: r };
  };
  P.claimDrop = function (s, now) {
    if (!P.dropReady(s, now)) return null;
    var step = P.dropStep(s, now), rw = P.dropReward(s, step);
    s.credits += rw.credits; s.runEarned += rw.credits; s.totalEarned += rw.credits;
    s.overdrive.stored = Math.min(E.overdriveCapHours(s) * 3600, s.overdrive.stored + rw.overdrive);
    s.daily.last = P.today(now);
    s.daily.step = (step + 1) % C().dailyDrops.length;
    s.stats.drops += 1;
    return rw;
  };
  P.describeDrop = function (def) {
    var parts = [];
    if (def.income) parts.push(hrs(def.income) + ' of income');
    if (def.overdrive) parts.push(hrs(def.overdrive) + ' Overdrive');
    return parts.join(' + ');
  };
  function hrs(h) { return h < 1 ? Math.round(h * 60) + ' min' : h + ' h'; }
})(typeof window !== 'undefined' ? window : globalThis);

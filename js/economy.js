/*
 * Game rules. Pure functions over a plain `state` object, so they can run in the
 * browser and in the balance simulator (tools/simulate.js) alike.
 */
(function (root) {
  var SW = root.SW = root.SW || {};
  var E = SW.econ = {};
  function C() { return SW.CONFIG; }

  // ---------- State ----------
  E.newState = function (now) {
    var s = {
      v: 1,
      credits: 0,
      runEarned: 0,
      totalEarned: 0,
      factories: {},
      upgrades: {},
      rocket: [],          // ids of built sections for the current rocket
      launches: 0,
      payload: 0,
      bestLaunch: 0,
      overdrive: { stored: 0, active: false },
      settings: { sci: false, bestHint: true, sound: true, music: true },
      ach: {},
      stats: { odUsed: 0, drops: 0 },
      daily: { step: 0, last: null },
      research: { levels: {}, active: null },
      modSeen: 0,
      moon: SW.moon ? SW.moon.fresh() : null,
      mars: SW.mars ? SW.mars.fresh() : null,
      kestrel: SW.kestrel ? SW.kestrel.fresh() : null,
      seen: {},
      playTime: 0,
      runTime: 0,
      created: now || Date.now(),
      lastSeen: now || Date.now(),
      dev: { enabled: false, speed: 1, income: 1 }
    };
    E.resetFactories(s);
    s.credits = C().factories[0].cost; // enough for the first Bolt Press
    return s;
  };

  E.resetFactories = function (s) {
    s.factories = {};
    C().factories.forEach(function (f) { s.factories[f.id] = { count: 0, progress: 0 }; });
  };

  // Fill in anything missing from an older save.
  E.migrate = function (s) {
    var fresh = E.newState(s.created);
    Object.keys(fresh).forEach(function (k) { if (s[k] === undefined) s[k] = fresh[k]; });
    C().factories.forEach(function (f) { if (!s.factories[f.id]) s.factories[f.id] = { count: 0, progress: 0 }; });
    if (!s.moon && SW.moon) s.moon = SW.moon.fresh();
    if (!s.mars && SW.mars) s.mars = SW.mars.fresh();
    if (!s.kestrel && SW.kestrel) s.kestrel = SW.kestrel.fresh();
    ['settings', 'overdrive', 'dev', 'stats', 'daily', 'research'].forEach(function (k) {
      Object.keys(fresh[k]).forEach(function (kk) { if (s[k][kk] === undefined) s[k][kk] = fresh[k][kk]; });
    });
    return s;
  };

  // ---------- Milestones ----------
  E.milestoneAt = function (i) {
    var m = C().milestones;
    if (i < m.length) return m[i];
    return m[m.length - 1] + (i - m.length + 1) * C().milestoneStep;
  };
  E.milestonesReached = function (count) {
    var i = 0;
    while (E.milestoneAt(i) <= count) i++;
    return i;
  };
  E.nextMilestone = function (count) { return E.milestoneAt(E.milestonesReached(count)); };
  E.prevMilestone = function (count) { var i = E.milestonesReached(count); return i ? E.milestoneAt(i - 1) : 0; };

  function speedDoublingsAllowed(f) {
    return Math.max(0, Math.floor(Math.log2(f.cycle / C().minCycle) + 1e-9));
  }
  // What the next milestone gives this factory: 'speed' or 'output'.
  E.nextMilestoneKind = function (f, count) {
    return E.milestonesReached(count) < speedDoublingsAllowed(f) ? 'speed' : 'output';
  };

  // ---------- Multipliers ----------
  E.factoryCycle = function (f, count) {
    var sd = Math.min(E.milestonesReached(count), speedDoublingsAllowed(f));
    return f.cycle / Math.pow(2, sd);
  };
  function milestoneOutputMult(f, count) {
    var m = E.milestonesReached(count), sd = speedDoublingsAllowed(f);
    return Math.pow(2, Math.max(0, m - sd));
  }
  function upgradeMultFor(s, fid) {
    var mult = 1;
    E.allUpgrades().forEach(function (u) {
      if (s.upgrades[u.id] && (u.target === fid || u.target === 'all')) mult *= (u.target !== 'all' && perk(s, 'noshop')) ? u.mult + 1 : u.mult;
    });
    return mult;
  }
  // ---------- Station modules and research effects ----------
  E.modules = function (s) { return C().stationModules.filter(function (m) { return s.payload >= m.at; }); };
  E.hasModule = function (s, id) { return E.modules(s).some(function (m) { return m.id === id; }); };
  E.nextModule = function (s) {
    var mods = C().stationModules;
    for (var i = 0; i < mods.length; i++) if (s.payload < mods[i].at) return mods[i];
    return null;
  };
  E.researchTrack = function (id) { return C().research.filter(function (r) { return r.id === id; })[0]; };
  E.researchLevel = function (s, id) { return (s.research && s.research.levels[id]) || 0; };
  // Sum (or product) of one effect across built modules and research levels.
  function effect(s, key, mode) {
    var v = mode === 'mul' ? 1 : 0;
    E.modules(s).forEach(function (m) { if (m.effect[key] !== undefined) v = mode === 'mul' ? v * m.effect[key] : v + m.effect[key]; });
    C().research.forEach(function (r) {
      var lvl = E.researchLevel(s, r.id);
      if (!lvl || !r.per || r.per[key] === undefined) return;
      v = mode === 'mul' ? v * Math.pow(r.per[key], lvl) : v + r.per[key] * lvl;
    });
    return v;
  }
  E.stationIncomeMult = function (s) {
    var m = 1;
    E.modules(s).forEach(function (x) { if (x.effect.income) m *= x.effect.income; });
    var lines = E.researchTrack('lines');
    return m * (1 + lines.per.income * E.researchLevel(s, 'lines'));
  };
  E.perTonne = function (s) { return C().payloadBonus + effect(s, 'perTonne'); };
  E.offlineRate = function (s) { if (twist(s, 'dark')) return 0; return C().offlineRate + effect(s, 'offline') + (SW.moon && SW.moon.has(s, 'relay') ? 0.15 : 0) + kes(s, 'offline'); };
  E.offlineCapHours = function (s) { return C().offlineCapHours + effect(s, 'offlineCap'); };
  E.overdriveCapHours = function (s) { return C().overdriveCapHours + effect(s, 'odCap') + kes(s, 'odCap'); };
  E.overdriveMult = function (s) { return C().overdriveMult + effect(s, 'odMult') + (perk(s, 'dark') ? 1 : 0); };
  E.rocketCostMult = function (s) { return effect(s, 'rocketCost', 'mul'); };
  E.payloadBoost = function (s) { return effect(s, 'payloadMult', 'mul') * (perk(s, 'manual') ? 1.5 : 1) * kes(s, 'payload', 'mul'); };
  E.headStart = function (s) {
    var t = E.researchTrack('headstart'), l = E.researchLevel(s, 'headstart');
    return l ? t.levels[l - 1] : 0;
  };

  // ---------- Research ----------
  E.researchOpen = function (s) { return E.hasModule(s, 'lab'); };
  E.researchNext = function (s) {
    return C().research.filter(function (r) { return E.researchLevel(s, r.id) < r.hours.length; });
  };
  E.researchDuration = function (r, level) { return r.hours[level] * 3600; };
  E.startResearch = function (s, id, now) {
    var r = E.researchTrack(id), lvl = E.researchLevel(s, id);
    if (!E.researchOpen(s) || s.research.active || !r || lvl >= r.hours.length) return false;
    var dur = E.researchDuration(r, lvl) * 1000 / kes(s, 'research', 'mul');
    s.research.active = { id: id, level: lvl + 1, start: now, end: now + dur };
    return true;
  };
  // Finishes the active project if its time is up. Returns the finished track or null.
  E.checkResearch = function (s, now) {
    var a = s.research.active;
    if (!a || now < a.end) return null;
    s.research.levels[a.id] = a.level;
    s.research.active = null;
    return E.researchTrack(a.id);
  };
  // What one level of a track does, in words.
  E.researchText = function (r, level) {
    if (r.id === 'lines') return 'All factories +' + (25 * level) + '%';
    if (r.id === 'telemetry') return 'Each tonne of payload: +' + (2 + 0.5 * level).toFixed(1).replace('.0', '') + '% income';
    if (r.id === 'crews') return 'Offline earnings +' + (5 * level) + '%';
    if (r.id === 'fuel') return 'Rocket sections ' + Math.round((1 - Math.pow(0.8, level)) * 100) + '% cheaper';
    if (r.id === 'headstart') return 'After a launch, start with ' + r.levels[level - 1] + ' of each of the first three factories';
    if (r.id === 'storage') return 'Overdrive stores ' + (4 * level) + ' more hours';
    return '';
  };

  function twist(s, id) { return SW.mars ? SW.mars.twist(s, id) : false; }
  function kes(s, key, mode) { return SW.kestrel ? SW.kestrel.effect(s, key, mode) : (mode === 'mul' ? 1 : 0); }
  E.kes = kes;
  function perk(s, id) { return SW.mars ? SW.mars.perk(s, id) : false; }
  E.twist = twist; E.perk = perk;
  function idx(f) { return C().factories.indexOf(f); }

  E.payloadMult = function (s) { return 1 + s.payload * E.perTonne(s); };
  E.achMult = function (s) { return 1 + (s.ach ? Object.keys(s.ach).length : 0) * C().achievementBonus; };
  E.overdriveOn = function (s) { return s.overdrive.active && s.overdrive.stored > 0 && !twist(s, 'dark'); };

  // Multiplier applied to every factory. opts.noOverdrive leaves Overdrive out.
  E.globalMult = function (s, opts) {
    var m = E.payloadMult(s) * E.achMult(s) * E.stationIncomeMult(s) * (SW.moon ? SW.moon.fusionMult(s) : 1) * (SW.mars ? SW.mars.incomeMult(s) : 1) * kes(s, 'income', 'mul') * (s.dev ? s.dev.income : 1);
    if (!(opts && opts.noOverdrive) && E.overdriveOn(s)) m *= E.overdriveMult(s);
    return m;
  };

  E.factoryCount = function (s, fid) { return s.factories[fid] ? s.factories[fid].count : 0; };

  // Credits per cycle and per second for a factory, optionally with a different count.
  E.factoryPerCycle = function (s, f, count, opts) {
    if (count === undefined) count = E.factoryCount(s, f.id);
    if (!count) return 0;
    if (twist(s, 'lean') && idx(f) >= 4) return 0;
    var leanPerk = perk(s, 'lean') && idx(f) < 4 ? 10 : 1;
    return f.revenue * count * milestoneOutputMult(f, count) * upgradeMultFor(s, f.id) * leanPerk * E.globalMult(s, opts);
  };
  E.factoryRate = function (s, f, count, opts) {
    if (count === undefined) count = E.factoryCount(s, f.id);
    if (!count) return 0;
    return E.factoryPerCycle(s, f, count, opts) / E.factoryCycle(f, count);
  };
  E.totalRate = function (s, opts) {
    return C().factories.reduce(function (sum, f) { return sum + E.factoryRate(s, f, undefined, opts); }, 0);
  };

  // ---------- Buying factories ----------
  E.costFor = function (f, owned, k) {
    var g = f.growth;
    return f.cost * Math.pow(g, owned) * (Math.pow(g, k) - 1) / (g - 1);
  };
  E.maxAffordable = function (f, owned, credits) {
    var g = f.growth, first = f.cost * Math.pow(g, owned);
    if (credits < first) return 0;
    var k = Math.floor(Math.log(credits * (g - 1) / first + 1) / Math.log(g));
    while (k > 0 && E.costFor(f, owned, k) > credits) k--; // float safety
    return k;
  };
  // How many a buy button purchases in the given mode (1, 10, 100 or 'max'). Never less than 1.
  E.buyCount = function (s, f, mode) {
    if (mode === 'max') return Math.max(1, E.maxAffordable(f, E.factoryCount(s, f.id), s.credits));
    return mode;
  };
  E.buyFactory = function (s, fid, k) {
    var f = E.factoryById(fid), owned = E.factoryCount(s, fid), cost = E.costFor(f, owned, k);
    if (cost > s.credits + 1e-9) return false;
    s.credits -= cost;
    s.factories[fid].count += k;
    return true;
  };
  E.factoryById = function (id) {
    var list = C().factories;
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  };
  E.isRevealed = function (s, f) {
    if (twist(s, 'lean') && idx(f) >= 4) return false;
    return E.factoryCount(s, f.id) > 0 || s.runEarned + C().factories[0].cost >= f.cost * C().revealAt || f === C().factories[0];
  };

  // Extra income per second from buying k more.
  E.deltaRate = function (s, f, k) {
    var c = E.factoryCount(s, f.id);
    return E.factoryRate(s, f, c + k, { noOverdrive: true }) - E.factoryRate(s, f, c, { noOverdrive: true });
  };

  // The revealed factory whose next purchase adds the most income per credit.
  E.bestValue = function (s, mode) {
    var best = null, bestScore = 0;
    C().factories.forEach(function (f) {
      if (!E.isRevealed(s, f)) return;
      var k = E.buyCount(s, f, mode);
      var score = E.deltaRate(s, f, k) / E.costFor(f, E.factoryCount(s, f.id), k);
      if (score > bestScore) { bestScore = score; best = f.id; }
    });
    return best;
  };

  // ---------- Upgrade shop ----------
  var upgradeCache = null;
  E.invalidate = function () { upgradeCache = null; };
  E.allUpgrades = function () {
    var cfg = C();
    if (upgradeCache) return upgradeCache;
    var list = [];
    cfg.factories.forEach(function (f) {
      cfg.upgradeTiers.forEach(function (tier, k) {
        list.push({
          id: f.id + '.' + k, target: f.id, mult: cfg.upgradeMult,
          cost: f.cost * cfg.upgradeBase * Math.pow(cfg.upgradeStep, k),
          name: tier + ' ' + f.name,
          desc: f.name + ' output ×' + cfg.upgradeMult
        });
      });
    });
    cfg.globalUpgrades.forEach(function (g, i) {
      list.push({ id: 'all.' + i, target: 'all', mult: g.mult, cost: g.cost, name: g.name, desc: 'All factories ×' + g.mult });
    });
    list.sort(function (a, b) { return a.cost - b.cost; });
    upgradeCache = list;
    return list;
  };
  // Upgrades you could buy next: not owned, and (for factory upgrades) you own that factory.
  E.shopList = function (s) {
    if (twist(s, 'noshop')) return [];
    return E.allUpgrades().filter(function (u) {
      if (s.upgrades[u.id]) return false;
      return u.target === 'all' || E.factoryCount(s, u.target) > 0;
    }).slice(0, C().shopShows);
  };
  E.shopUnlocked = function (s) {
    if (twist(s, 'noshop')) return false;
    if (s.launches > 0 || s.seen.shop) return true;
    var first = E.allUpgrades()[0];
    return s.runEarned >= first.cost * 0.5;
  };
  E.buyUpgrade = function (s, uid) {
    var u = E.allUpgrades().find(function (x) { return x.id === uid; });
    if (!u || s.upgrades[uid] || s.credits < u.cost) return false;
    s.credits -= u.cost;
    s.upgrades[uid] = true;
    return true;
  };

  // ---------- Rocket and launch ----------
  E.rocketTabUnlocked = function (s) { return s.launches > 0 || s.runEarned >= C().rocketTabAt || s.seen.rocket; };
  E.sectionCost = function (s, sec) { return sec.cost * Math.pow(C().rocketCostGrowth, s.launches) * E.rocketCostMult(s); };
  E.nextSection = function (s) {
    var secs = C().rocketSections;
    for (var i = 0; i < secs.length; i++) if (s.rocket.indexOf(secs[i].id) < 0) return secs[i];
    return null;
  };
  E.buySection = function (s, id) {
    var sec = E.nextSection(s);
    if (!sec || sec.id !== id) return false;
    var cost = E.sectionCost(s, sec);
    if (s.credits < cost) return false;
    s.credits -= cost;
    s.rocket.push(id);
    return true;
  };
  E.rocketReady = function (s) { return E.nextSection(s) === null; };
  E.payloadTotalFor = function (earned, boost) { return Math.floor(Math.cbrt(earned / C().payloadDivisor) * (boost || 1) + 1e-9); };
  E.payloadGain = function (s) { return Math.max(0, E.payloadTotalFor(s.totalEarned, E.payloadBoost(s)) - s.payload); };
  // More credits to earn before the launch gives one more tonne.
  E.creditsToNextTonne = function (s) {
    var next = (s.payload + E.payloadGain(s) + 1) / E.payloadBoost(s);
    return Math.max(0, next * next * next * C().payloadDivisor - s.totalEarned);
  };
  // force: the Mass Driver launches without a rocket.
  E.launch = function (s, force) {
    if (!force && !E.rocketReady(s)) return 0;
    var gain = E.payloadGain(s);
    s.payload += gain;
    s.bestLaunch = Math.max(s.bestLaunch, gain);
    s.launches += 1;
    s.credits = C().factories[0].cost;
    s.runEarned = 0;
    s.runTime = 0;
    s.upgrades = {};
    s.rocket = [];
    E.resetFactories(s);
    var hs = E.headStart(s);
    if (hs) C().factories.slice(0, 3).forEach(function (f) { s.factories[f.id].count = hs; });
    return gain;
  };
  E.rocketName = function (s) {
    var roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
    var n = s.launches + 1;
    return 'Rocket Mk ' + (n <= 10 ? roman[n - 1] : n);
  };

  // ---------- Station preview ----------
  // ---------- Time ----------
  function earn(s, amt) { s.credits += amt; s.runEarned += amt; s.totalEarned += amt; }

  // Advance the game by dt seconds while the app is open.
  E.tick = function (s, dt) {
    if (dt <= 0) return;
    if (SW.moon) SW.moon.tick(s, dt);
    s.playTime += dt; s.runTime += dt;
    var od = s.overdrive;
    if (od.active && od.stored > 0) {
      if (s.stats) s.stats.odUsed += Math.min(dt, od.stored);
      od.stored = Math.max(0, od.stored - dt);
      if (od.stored === 0) od.active = false;
    }
    C().factories.forEach(function (f) {
      var st = s.factories[f.id];
      if (!st.count) return;
      st.progress += dt / E.factoryCycle(f, st.count);
      if (st.progress >= 1) {
        var n = Math.floor(st.progress);
        st.progress -= n;
        earn(s, n * E.factoryPerCycle(s, f));
      }
    });
  };

  // Apply time spent away. Returns a summary for the "While you were away" card.
  E.applyAway = function (s, seconds) {
    if (seconds <= 0) return null;
    var cfg = C();
    var earnSec = Math.min(seconds, E.offlineCapHours(s) * 3600);
    var credits = E.totalRate(s, { noOverdrive: true }) * earnSec * E.offlineRate(s);
    earn(s, credits);
    var cap = E.overdriveCapHours(s) * 3600;
    var before = s.overdrive.stored;
    if (!twist(s, 'dark')) s.overdrive.stored = Math.min(cap, before + seconds);
    s.overdrive.active = false;
    var he3 = SW.moon ? SW.moon.away(s, seconds) : 0;
    return { seconds: seconds, credits: credits, overdrive: s.overdrive.stored - before, capped: seconds > earnSec, he3: he3 };
  };

  E.toggleOverdrive = function (s) {
    if (s.overdrive.stored <= 0 || twist(s, 'dark')) { s.overdrive.active = false; return false; }
    s.overdrive.active = !s.overdrive.active;
    return true;
  };
})(typeof window !== 'undefined' ? window : globalThis);

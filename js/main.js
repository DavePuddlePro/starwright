/* Game loop, saving, time away, Ori's tips, launch, reset and the dev menu. */
(function (root) {
  var SW = root.SW, E = SW.econ, U = SW.ui;
  function C() { return SW.CONFIG; }
  function fmt(n) { return SW.fmt(n, G.s.settings.sci); }

  var G = SW.game = { s: null, tab: 'factories', mode: 1, launching: false, pulse: {}, tipQueue: [], stationView: 'modules', freshModule: null };

  // ---------- Saving ----------
  function load() {
    try {
      var raw = localStorage.getItem(C().saveKey);
      if (raw) return E.migrate(JSON.parse(raw));
    } catch (e) { /* storage blocked or save unreadable: start fresh */ }
    return null;
  }
  function save() {
    G.s.lastSeen = Date.now();
    try { localStorage.setItem(C().saveKey, JSON.stringify(G.s)); } catch (e) { /* ignore */ }
  }
  SW.save = save;

  // ---------- Ori's tips ----------
  var TIPS = {
    start: 'This yard used to build rockets. Let\'s wake it up. Buy a Bolt Press to start earning credits.',
    milestone: 'Every factory gets a bonus at 10, 25, 50 and beyond. The little ticks under each one show how close the next bonus is.',
    shop: 'The Upgrades tab is open. Upgrades multiply a factory\'s output until our next launch.',
    rocket: 'We\'ve earned enough to start a rocket. Build its four sections in the Rocket tab.',
    ready: 'The rocket is ready. Launching sends payload to orbit. The factories start over, but every tonne up there makes them faster forever.',
    station: 'That payload is the start of Harbor Station. Check the Station tab to see what it will become.',
    core: 'Harbor Station is online. Every new module adds a lasting power, and the Station tab shows what\'s next.',
    lab: 'The Research Lab is open. Pick a project in the Station tab. It keeps running even while you\'re away.',
    moon: 'The Observatory found a good spot on the Moon. Our base there mines Helium-3, even while you\'re away. Spend it on the Fusion Reactor to multiply everything.',
    driver: 'The Mass Driver can launch for us now, no rocket needed. Choose when it fires in the Rocket tab.',
    mars: 'Mars is in reach. An expedition starts everything over, even payload and the Moon, but the colonists it lands make everything faster for good.',
    missions: 'Missions are open. Each one is an expedition with a twist. Finish it to earn a perk that lasts forever.',
    kestrel: 'The colony is ready to build Kestrel. From now on, every expedition that lands a colonist brings home a piece of her.',
    longway: 'There are more stars out there. Each one has its own bonus and its own twist. Let\'s see how far we can go.',
    drop: 'A Supply Drop arrives every day. Open it in the More tab for free income and Overdrive.'
  };
  function tip(key, pulseTab) {
    if (G.s.seen['tip.' + key]) return;
    G.s.seen['tip.' + key] = true;
    if (pulseTab) G.pulse[pulseTab] = true;
    G.tipQueue.push(key);
    showNextTip();
  }
  function showNextTip() {
    if (U.sheetOpen() || G.launching || !G.tipQueue.length) return;
    var key = G.tipQueue.shift();
    U.sheet(U.oriSays(TIPS[key]) + '<div class="btns"><button class="primary" data-sheet="ok">Got it</button></div>', { ok: U.closeSheet });
  }
  function checkTips() {
    var s = G.s;
    if (C().factories.some(function (f) { return s.factories[f.id].count >= 3; })) tip('milestone');
    if (E.shopUnlocked(s)) { s.seen.shop = true; tip('shop', 'upgrades'); }
    if (E.rocketTabUnlocked(s)) { s.seen.rocket = true; tip('rocket', 'rocket'); }
    if (s.launches === 0 && E.rocketReady(s) && E.payloadGain(s) > 0) tip('ready', 'rocket');
    if (s.playTime > 240 && SW.prog.dropReady(s)) tip('drop', 'more');
    var mods = E.modules(s);
    if (mods.length > s.modSeen) {
      var newMods = mods.slice(s.modSeen);
      newMods.slice(-3).forEach(function (m) { U.toast('Station module online', m.name, m.text); });
      s.modSeen = mods.length;
      G.freshModule = mods[mods.length - 1].id;
      SW.audio.play('build');
      if (newMods.some(function (m) { return m.id === 'core'; })) tip('core', 'station');
      if (newMods.some(function (m) { return m.id === 'lab'; })) { G.stationView = 'research'; tip('lab', 'station'); }
      U.rebuild();
    }
    if (SW.moon.open(s) && !s.moon.started) {
      SW.moon.start(s);
      if (s.mars.expeditions === 0) {
        G.stationView = 'moon';
        U.toast('Era IV', 'The Quiet Side', 'A base on the Moon is online.');
        SW.audio.play('achieve');
      } else U.toast('Moon base', 'Back online', 'Helium-3 mining has restarted.');
      tip('moon', 'station');
      tip('driver', 'rocket');
      U.rebuild();
      save();
    }
    if (SW.mars.open(s) && !s.seen['tip.mars']) {
      U.toast('Era V', 'Red Dust', 'An expedition to Mars is ready to plan.');
      SW.audio.play('achieve');
      G.stationView = 'mars';
      tip('mars', 'station');
      U.rebuild();
    }
    if (SW.kestrel.open(s) && !s.seen['tip.kestrel']) {
      U.toast('Era VI', 'Kestrel', 'Every expedition now brings home a piece of the starship.');
      SW.audio.play('achieve');
      G.stationView = 'kestrel';
      tip('kestrel', 'station');
      U.rebuild();
    }
    // Kestrel finished but the ending never played (e.g. the app closed mid-ending): play it now.
    if (SW.kestrel.complete(s) && !s.kestrel.ended && !U.sheetOpen() && !G.launching) playEnding();
    var doneM = SW.mars.checkMission(s);
    if (doneM) {
      U.toast('Mission complete', doneM.name, doneM.perk);
      SW.audio.play('achieve');
      U.rebuild();
      save();
    }
    var doneR = E.checkResearch(s, Date.now());
    if (doneR) {
      var lv = E.researchLevel(s, doneR.id);
      U.toast('Research complete', doneR.name + ' · level ' + lv, E.researchText(doneR, lv));
      SW.audio.play('achieve');
      U.rebuild();
      save();
    }
    var fresh = SW.prog.check(s);
    fresh.slice(0, 3).forEach(function (a) { U.toast('Achievement · +' + Math.round(C().achievementBonus * 100) + '% income', a.name, a.desc); });
    if (fresh.length > 3) U.toast('Achievements', '+' + (fresh.length - 3) + ' more', 'See them all in the More tab.');
    if (fresh.length) SW.audio.play('achieve');
  }

  // ---------- Time away ----------
  function handleAway(seconds) {
    var sum = E.applyAway(G.s, seconds);
    if (!sum || seconds < C().awayCardMinSeconds) return;
    var s = G.s, first = !s.seen['tip.overdrive'];
    s.seen['tip.overdrive'] = true;
    var html = '<h3>While you were away</h3>' +
      (first ? U.oriSays('Time away charges Overdrive. Turn it on for ×' + E.overdriveMult(G.s) + ' on everything until it runs out, or save it for later.') : '') +
      '<div class="lines">' +
      '<div class="line"><span>Away for</span><b>' + SW.fmtDuration(sum.seconds) + '</b></div>' +
      '<div class="line"><span>Credits earned (' + Math.round(E.offlineRate(G.s) * 100) + '% rate' + (sum.capped ? ', ' + E.offlineCapHours(G.s) + ' h max' : '') + ')</span><b>+' + fmt(sum.credits) + '</b></div>' +
      '<div class="line"><span>Overdrive stored</span><b class="o">' + SW.fmtClock(s.overdrive.stored) + '</b></div>' +
      (sum.he3 ? '<div class="line"><span>Helium-3 mined</span><b>+' + fmt(sum.he3) + '</b></div>' : '') +
      '</div><div class="btns"><button class="secondary" data-sheet="later">Later</button><button class="primary" data-sheet="go">Start Overdrive</button></div>';
    var wasOpen = U.sheetOpen();
    if (wasOpen) U.closeSheet();
    setTimeout(function () {
      U.sheet(html, {
        later: U.closeSheet,
        go: function () { if (!E.overdriveOn(G.s)) { E.toggleOverdrive(G.s); SW.audio.play('overdrive'); } U.closeSheet(); save(); }
      });
    }, wasOpen ? 300 : 0);
  }

  // ---------- Actions (called by the UI) ----------
  var A = SW.actions = {};
  A.tab = function (id) { if (id !== G.tab) SW.audio.play('tap'); G.tab = id; delete G.pulse[id]; document.getElementById('panel').scrollTop = 0; };
  A.mode = function (m) { G.mode = m; };
  A.buyFactory = function (id, btn) {
    var f = E.factoryById(id), k = E.buyCount(G.s, f, G.mode);
    if (E.buyFactory(G.s, id, k)) { U.pop(btn, '+' + k); SW.audio.play('buy'); }
  };
  A.buyUpgrade = function (id, btn) { if (E.buyUpgrade(G.s, id)) { U.pop(btn, 'Bought'); SW.audio.play('upgrade'); } };
  A.buySection = function (id, btn) { if (E.buySection(G.s, id)) { U.pop(btn, 'Built'); SW.audio.play('build'); save(); } };
  A.startResearch = function (id, btn) {
    if (E.startResearch(G.s, id, Date.now())) { U.pop(btn, 'Started'); SW.audio.play('upgrade'); save(); }
  };
  A.moonBuy = function (kind, id, btn) {
    var s = G.s, M = SW.moon, ok = false;
    if (kind === 'rig') ok = M.buyRig(s, id);
    if (kind === 'fusion') ok = M.buyFusion(s);
    if (kind === 'base') ok = M.buyBase(s, id);
    if (!ok) return;
    U.pop(btn, kind === 'fusion' ? 'Level ' + s.moon.fusion : kind === 'rig' ? '+1' : 'Online');
    SW.audio.play(kind === 'rig' ? 'buy' : 'upgrade');
    save();
  };
  A.autoToggle = function (key) { var a = G.s.moon.auto; a[key] = !a[key]; SW.audio.play(a[key] ? 'upgrade' : 'off'); save(); };
  A.threshold = function (v) { G.s.moon.auto.threshold = v; SW.audio.play('tap'); save(); };
  A.askExpedition = function (missionId) {
    var s = G.s, R = SW.mars, g = R.gain(s), m = missionId ? R.mission(missionId) : null;
    if (!R.open(s) || (!m && g <= 0)) return;
    var after = Math.pow(C().mars.incomePerColonist, s.mars.colonists + g);
    U.sheet('<h3>' + (m ? 'Mission: ' + m.name : 'Expedition to Mars') + '</h3><div class="lines">' +
      (m ? '<div class="line"><span>Twist</span><b>' + m.twist + '</b></div><div class="line"><span>Goal</span><b>' + fmt(m.goal) + ' t payload</b></div><div class="line"><span>Reward</span><b class="o">' + m.perk + '</b></div>' : '') +
      '<div class="line"><span>Colonists</span><b class="o">+' + fmt(g) + ' (total ' + fmt(s.mars.colonists + g) + ')</b></div>' +
      '<div class="line"><span>Income from colonists</span><b>×' + fmt(R.incomeMult(s)) + ' → ×' + fmt(after) + '</b></div>' +
      '<div class="line"><span>Starts over</span><b>Factories, payload, station, Moon</b></div>' +
      '<div class="line"><span>You keep</span><b>Colonists, research, achievements, Overdrive</b></div>' +
      '</div><div class="btns"><button class="secondary" data-sheet="no">Not yet</button><button class="primary" data-sheet="yes">' + (m ? 'Start mission' : 'Launch expedition') + '</button></div>',
      { no: U.closeSheet, yes: function () { U.closeSheet(); doExpedition(missionId); } });
  };
  function doExpedition(missionId) {
    var flash = document.getElementById('flash'), first = G.s.mars.expeditions === 0;
    SW.audio.play('launch');
    flash.classList.add('show');
    setTimeout(function () {
      var s = G.s, g = SW.mars.expedition(s, missionId);
      var seg = SW.kestrel.afterExpedition(s, g);
      G.tab = 'factories'; G.stationView = 'mars';
      save();
      U.rebuild();
      flash.classList.remove('show');
      U.sheet('<h3>' + (missionId ? 'Mission started' : 'Landed on Mars') + '</h3>' +
        U.oriSays(first ? 'We made it to Mars. Back home the yard, the station and the Moon start over, but our colonists make every factory far faster.' : missionId ? 'New rules this time. Reach the goal and the reward is ours for good.' : 'More colonists down safely. Let\'s rebuild, faster than ever.') +
        '<div class="lines"><div class="line"><span>Colonists landed</span><b class="o">+' + fmt(g || 0) + '</b></div><div class="line"><span>Total colonists</span><b>' + fmt(s.mars.colonists) + '</b></div>' +
        '<div class="line"><span>Income from colonists</span><b>×' + fmt(SW.mars.incomeMult(s)) + '</b></div>' +
        (seg ? '<div class="line"><span>Kestrel segment ' + s.kestrel.built + ' / 12</span><b class="o">' + seg.name + '</b></div><div class="line"><span></span><b>' + seg.text + '</b></div>' : '') + '</div>' +
        '<div class="btns"><button class="primary" data-sheet="ok">' + (seg && SW.kestrel.complete(s) ? 'Kestrel is ready' : 'Back to the yard') + '</button></div>',
        { ok: function () { U.closeSheet(); if (first) tip('missions', 'station'); if (SW.kestrel.complete(s) && !s.kestrel.ended) setTimeout(playEnding, 400); } });
    }, 1400);
  }
  // ---------- The ending ----------
  function playEnding() {
    var s = G.s;
    if (document.getElementById('ending') || s.kestrel.ended) return;
    G.launching = true; // pauses tips and automation while it plays
    SW.audio.setScene('space');
    var lines = [
      'Kestrel is complete.',
      'Twelve segments, carried up one launch and one expedition at a time.',
      'Ori takes one last look at Earth.',
      'Down there, in a yard that sat dark for years, the lights are on. People are looking up again.',
      'Kestrel lights her engines and leaves for another star.'
    ];
    var el = document.createElement('div');
    el.id = 'ending';
    el.innerHTML = '<div class="end-art">' + SW.art.kestrel() + '</div>' +
      lines.map(function (t, i) { return '<p style="animation-delay:' + (1.2 + i * 2.6) + 's">' + t + '</p>'; }).join('') +
      '<div class="end-stats" style="animation-delay:' + (1.2 + lines.length * 2.6) + 's">' +
      '<span>' + SW.fmtDuration(s.playTime) + ' played</span><span>' + fmt(s.mars.expeditions) + ' expedition' + (s.mars.expeditions === 1 ? '' : 's') + '</span><span>' + fmt(s.mars.colonists) + ' colonists</span></div>' +
      '<button class="primary" id="end-go" style="animation-delay:' + (2 + lines.length * 2.6) + 's">Keep going</button>';
    document.body.appendChild(el);
    for (var i = 0; i < 12; i++) { var g = el.querySelector('#kseg-' + i); if (g) g.classList.add('on'); }
    requestAnimationFrame(function () { el.classList.add('show'); });
    SW.audio.play('achieve');
    document.getElementById('end-go').addEventListener('click', function () {
      SW.kestrel.startLongWay(s);
      save();
      el.classList.remove('show');
      setTimeout(function () { el.remove(); }, 800);
      G.launching = false;
      G.tab = 'station'; G.stationView = 'kestrel';
      U.rebuild();
      U.toast('The Long Way', 'A new star: ' + s.kestrel.system.name, s.kestrel.system.bonus.text);
      tip('longway', 'station');
    });
  }
  SW.playEnding = playEnding;

  A.askJump = function () {
    var s = G.s, K = SW.kestrel;
    if (!K.canJump(s)) return;
    var next = K.makeSystem(s.kestrel.rank + 1), tw = next.twist ? C().mars.missions.filter(function (m) { return m.id === next.twist; })[0] : null;
    U.sheet('<h3>Jump to ' + next.name + '?</h3><div class="lines">' +
      '<div class="line"><span>Distance</span><b>' + s.kestrel.system.distance + ' lightyears</b></div>' +
      '<div class="line"><span>Star rank</span><b class="o">' + s.kestrel.rank + ' → ' + (s.kestrel.rank + 1) + ' (income ×' + C().kestrel.rankIncome + ')</b></div>' +
      '<div class="line"><span>Colonists landing</span><b>+' + fmt(SW.mars.gain(s)) + '</b></div>' +
      '<div class="line"><span>Next system</span><b>' + next.bonus.text + '</b></div>' +
      '<div class="line"><span>Twist there</span><b>' + (tw ? tw.twist : 'None') + '</b></div>' +
      '<div class="line"><span>Starts over</span><b>Factories, payload, station, Moon</b></div>' +
      '</div><div class="btns"><button class="secondary" data-sheet="no">Not yet</button><button class="primary" data-sheet="yes">Jump</button></div>',
      { no: U.closeSheet, yes: function () {
        U.closeSheet();
        var flash = document.getElementById('flash');
        SW.audio.play('launch');
        flash.classList.add('show');
        setTimeout(function () {
          var res = K.jump(s);
          save(); U.rebuild();
          flash.classList.remove('show');
          if (res) U.toast('Arrived · rank ' + s.kestrel.rank, res.to.name, res.to.bonus.text);
        }, 1400);
      } });
  };

  A.abandonMission = function () { SW.mars.abandon(G.s); SW.audio.play('off'); U.rebuild(); save(); };
  A.claimDrop = function () {
    var s = G.s, rw = SW.prog.claimDrop(s);
    if (!rw) return;
    SW.audio.play('claim');
    save();
    U.sheet('<h3>Supply Drop · Day ' + (rw.step + 1) + '</h3><div class="lines">' +
      (rw.credits ? '<div class="line"><span>Credits</span><b class="o">+' + fmt(rw.credits) + '</b></div>' : '') +
      (rw.overdrive ? '<div class="line"><span>Overdrive added</span><b class="o">+' + SW.fmtDuration(rw.overdrive) + '</b></div>' : '') +
      '<div class="line"><span>Next drop</span><b>Tomorrow</b></div></div>' +
      '<div class="btns"><button class="primary" data-sheet="ok">Nice</button></div>', { ok: U.closeSheet });
  };
  A.overdrive = function () {
    var s = G.s;
    if (s.overdrive.stored <= 0) {
      U.sheet('<h3>Overdrive</h3><p style="margin:0;color:var(--muted)">Time you spend away charges Overdrive (1 minute away = 1 minute stored, up to ' + E.overdriveCapHours(G.s) + ' hours). When you\'re back, tap here for ×' + E.overdriveMult(G.s) + ' on everything until it runs out.</p><div class="btns"><button class="primary" data-sheet="ok">Got it</button></div>', { ok: U.closeSheet });
      return;
    }
    E.toggleOverdrive(s);
    SW.audio.play(E.overdriveOn(s) ? 'overdrive' : 'off');
  };
  A.setting = function (key) {
    G.s.settings[key] = !G.s.settings[key];
    if (key === 'sound' || key === 'music') { SW.audio.setEnabled(key, G.s.settings[key]); SW.audio.unlock(); }
    save();
  };
  A.sheetClosed = function () { showNextTip(); };

  A.askLaunch = function () {
    var s = G.s, g = E.payloadGain(s), b = E.perTonne(G.s), driver = SW.moon.has(s, 'driver');
    if ((!driver && !E.rocketReady(s)) || g <= 0) return;
    U.sheet('<h3>Launch ' + (driver ? 'with the Mass Driver' : E.rocketName(s)) + '?</h3><div class="lines">' +
      '<div class="line"><span>Payload to orbit</span><b class="o">+' + fmt(g) + ' t</b></div>' +
      '<div class="line"><span>Income bonus, forever</span><b>+' + fmt(Math.round(s.payload * b * 100)) + '% → +' + fmt(Math.round((s.payload + g) * b * 100)) + '%</b></div>' +
      '<div class="line"><span>Starts over</span><b>Factories, credits, upgrades' + (driver ? '' : ', rocket') + '</b></div>' +
      '<div class="line"><span>You keep</span><b>Payload, Overdrive, settings</b></div>' +
      '</div><div class="btns"><button class="secondary" data-sheet="no">Not yet</button><button class="primary" data-sheet="yes">Launch</button></div>',
      { no: U.closeSheet, yes: function () { U.closeSheet(); if (driver) driverLaunch(false); else doLaunch(); } });
  };
  // Mass Driver launch: quick, no rocket, no big animation.
  function driverLaunch(auto) {
    var s = G.s, gain = E.launch(s, true);
    if (!gain) return;
    if (auto) s.stats.autoLaunches = (s.stats.autoLaunches || 0) + 1;
    save();
    U.rebuild();
    var flash = document.getElementById('flash');
    flash.classList.add('show');
    setTimeout(function () { flash.classList.remove('show'); }, 450);
    SW.audio.play('build');
    U.toast(auto ? 'Mass Driver · auto-launch' : 'Mass Driver launch', '+' + fmt(gain) + ' t to orbit', 'Payload in orbit: ' + fmt(s.payload) + ' t · income +' + fmt(Math.round(s.payload * E.perTonne(s) * 100)) + '%');
  }

  // Moon automation: Foreman, Quartermaster and the Mass Driver.
  function automate() {
    var s = G.s, M = SW.moon;
    if (!s.moon || !s.moon.started || G.launching || E.twist(s, 'manual')) return;
    if (M.has(s, 'quarter') && s.moon.auto.upgrades) {
      for (var u = 0; u < 10; u++) {
        var list = E.shopList(s);
        if (!list.length || list[0].cost > s.credits || !E.buyUpgrade(s, list[0].id)) break;
      }
    }
    if (M.has(s, 'foreman') && s.moon.auto.buy) {
      for (var i = 0; i < 25; i++) {
        var id = E.bestValue(s, 1);
        if (!id) break;
        var f = E.factoryById(id);
        if (E.costFor(f, E.factoryCount(s, id), 1) > s.credits) break;
        E.buyFactory(s, id, 1);
      }
    }
    if (M.autoReady(s) && !U.sheetOpen()) driverLaunch(true);
  }

  function doLaunch() {
    var app = document.getElementById('app'), flash = document.getElementById('flash');
    G.launching = true;
    G.tab = 'factories';
    app.classList.add('launching');
    SW.audio.play('launch');
    setTimeout(function () { flash.classList.add('show'); }, 2600);
    setTimeout(function () {
      var s = G.s, before = s.payload, gain = E.launch(s);
      save();
      app.classList.remove('launching');
      G.launching = false;
      U.rebuild();
      flash.classList.remove('show');
      var first = s.launches === 1;
      U.sheet('<h3>Payload delivered</h3>' +
        U.oriSays(first ? 'We made it to orbit. Back on the ground the yard starts over, but every factory now runs faster. Let\'s build the next one.' : 'Another one up. The yard is ready to go again.') +
        '<div class="lines"><div class="line"><span>Delivered</span><b class="o">+' + fmt(gain) + ' t</b></div>' +
        '<div class="line"><span>In orbit</span><b>' + fmt(s.payload) + ' t</b></div>' +
        '<div class="line"><span>Income bonus</span><b>+' + fmt(Math.round(s.payload * E.perTonne(G.s) * 100)) + '%</b></div></div>' +
        '<div class="btns"><button class="primary" data-sheet="ok">Back to the yard</button></div>',
        { ok: function () { U.closeSheet(); if (first) tip('station', 'station'); } });
    }, 3500);
  }

  A.askReset = function () {
    var timer = null;
    U.sheet('<h3>Reset all progress?</h3><p style="margin:0;color:var(--muted)">This erases everything: factories, payload, Overdrive and settings. It can\'t be undone.</p>' +
      '<div class="btns"><button class="secondary" data-sheet="no">Cancel</button><button class="secondary danger hold" id="hold-reset"><i></i><span>Hold to reset</span></button></div>',
      { no: U.closeSheet });
    var hb = document.getElementById('hold-reset');
    function start(e) { e.preventDefault(); hb.classList.add('go'); timer = setTimeout(wipe, 2000); }
    function stop() { hb.classList.remove('go'); clearTimeout(timer); }
    hb.addEventListener('pointerdown', start);
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { hb.addEventListener(ev, stop); });
  };
  function wipe() {
    try { localStorage.removeItem(C().saveKey); } catch (e) { /* ignore */ }
    G.s = E.newState(Date.now());
    G.tab = 'factories'; G.pulse = {}; G.tipQueue = [];
    U.rebuild();
    U.closeSheet();
    setTimeout(function () { tip('start'); }, 300);
    save();
  }

  // Dev menu: tap the version number 5 times.
  var taps = [];
  A.versionTap = function () {
    if (!C().devAllowed) return;
    var now = Date.now();
    taps = taps.filter(function (t) { return now - t < 3000; });
    taps.push(now);
    if (taps.length >= 5 && !G.s.dev.enabled) { G.s.dev.enabled = true; taps = []; save(); }
  };
  A.dev = function (what) {
    var s = G.s, d = s.dev;
    if (!C().devAllowed || !d.enabled) return;
    if (what === 'hour') s.credits += E.totalRate(s, { noOverdrive: true }) * 3600;
    if (what === 'x100') s.credits = Math.max(s.credits * 100, 1000);
    if (what === 'away') handleAway(3600);
    if (what === 'away8') handleAway(8 * 3600);
    if (what === 'od') s.overdrive.stored = Math.min(E.overdriveCapHours(G.s) * 3600, s.overdrive.stored + 3600);
    if (what === 'payload') s.payload += 10;
    if (what === 'kestrel') { if (s.mars.colonists < C().kestrel.unlockColonists) s.mars.colonists = C().kestrel.unlockColonists; if (!SW.kestrel.complete(s)) s.kestrel.built += 1; if (SW.kestrel.complete(s) && !s.kestrel.ended) setTimeout(playEnding, 300); }
    if (what === 'mars' && s.moon.started) s.moon.fusion = Math.max(s.moon.fusion, C().mars.unlockFusion);
    if (what === 'he3' && s.moon.started) { s.moon.he3 += Math.max(1000, s.moon.he3 * 9); s.moon.total += 1000; }
    if (what === 'rocket') s.rocket = C().rocketSections.map(function (x) { return x.id; });
    if (what === 'speed') d.speed = d.speed === 1 ? 10 : d.speed === 10 ? 100 : 1;
    if (what === 'income') d.income = d.income === 1 ? 10 : d.income === 10 ? 1000 : 1;
    if (what === 'research' && s.research.active) s.research.active.end = Date.now();
    if (what === 'tips') Object.keys(s.seen).forEach(function (k) { if (k.indexOf('tip.') === 0) delete s.seen[k]; });
    if (what === 'off') { d.enabled = false; d.speed = 1; d.income = 1; }
    save();
  };

  // ---------- Loop ----------
  var last = Date.now(), lastSave = Date.now(), lastTips = 0, lastAuto = 0;
  function frame() {
    var now = Date.now(), dt = (now - last) / 1000;
    last = now;
    if (dt > 10) handleAway(dt);
    else if (dt > 0) E.tick(G.s, dt * G.s.dev.speed);
    if (now - lastSave > C().autosaveSeconds * 1000) { lastSave = now; save(); }
    if (now - lastTips > 500) { lastTips = now; checkTips(); }
    if (now - lastAuto > 250) { lastAuto = now; automate(); }
    SW.audio.setScene(G.tab === 'station' || G.launching ? 'space' : 'earth');
    U.update(performance.now());
    requestAnimationFrame(frame);
  }

  function start() {
    var now = Date.now();
    var loaded = load();
    G.s = loaded || E.newState(now);
    if (!C().devAllowed) { G.s.dev.enabled = false; G.s.dev.speed = 1; G.s.dev.income = 1; }
    U.init(G);
    SW.audio.setEnabled('sound', G.s.settings.sound);
    SW.audio.setEnabled('music', G.s.settings.music);
    document.addEventListener('pointerdown', function () { SW.audio.unlock(); }, true);
    last = now;
    if (loaded) {
      var away = (now - G.s.lastSeen) / 1000;
      if (away > 10) handleAway(away);
      else if (away > 0) E.tick(G.s, away);
    } else {
      tip('start');
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { save(); SW.audio.pause(); }
      else SW.audio.resume(); /* the next frame sees the gap and counts it as time away */
    });
    window.addEventListener('pagehide', save);
    requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})(typeof window !== 'undefined' ? window : globalThis);

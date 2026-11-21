/* Screen building and updating. Reads SW.game.s (the state); calls back into SW.actions for anything that changes it. */
(function (root) {
  var SW = root.SW;
  var E = SW.econ, A = SW.art;
  var U = SW.ui = {};
  var G, els = {}, rows = {}, panelSig = '', lastText = 0;
  function C() { return SW.CONFIG; }
  function fmt(n) { return SW.fmt(n, G.s.settings.sci); }
  function $(id) { return document.getElementById(id); }
  function setText(el, t) { if (el && el.textContent !== t) el.textContent = t; }
  function cls(el, c, on) { if (el && el.classList.contains(c) !== !!on) el.classList.toggle(c, !!on); }

  var TABS = [
    { id: 'factories', label: 'Factories', icon: 'factory' },
    { id: 'upgrades', label: 'Upgrades', icon: 'up' },
    { id: 'rocket', label: 'Rocket', icon: 'rocket' },
    { id: 'station', label: 'Station', icon: 'station' },
    { id: 'more', label: 'More', icon: 'more' }
  ];

  U.init = function (game) {
    G = game;
    document.body.insertAdjacentHTML('afterbegin', A.defs + SW.art2.defs);
    var app = $('app');
    app.innerHTML =
      '<div class="world" id="world"></div>' +
      '<div class="hud bal glass"><div class="lbl">Credits</div><div class="big tnum" id="credits">0</div><div class="rate tnum" id="rate"></div></div>' +
      '<button class="hud od glass" id="od" aria-label="Overdrive"><span class="bolt"><svg width="18" height="18" viewBox="0 0 18 18"><path d="M10 1L3 10h5l-1 7 7-9H9z" fill="currentColor"/></svg></span>' +
      '<span class="odt"><b id="od-b">Overdrive</b><span id="od-s" class="tnum">0:00:00</span></span></button>' +
      '<div class="hud goal glass"><div class="row"><span id="goal-l"></span><b id="goal-r" class="tnum"></b></div><div class="sub" id="goal-s"></div><div class="bar o"><i id="goal-bar"></i></div></div>' +
      '<section class="drawer"><div class="grab"></div><main class="panel" id="panel"></main></section>' +
      '<nav class="dock glass" id="nav">' + TABS.map(function (t) {
        return '<button data-tab="' + t.id + '" id="tab-' + t.id + '" aria-label="' + t.label + '">' + A.icon(t.icon) + '<span class="tl">' + t.label + '</span><i class="dot"></i></button>';
      }).join('') + '</nav>';
    document.body.insertAdjacentHTML('beforeend', '<div id="overlay"></div><div id="flash"></div><div id="devbadge" hidden>DEV</div>');
    ['world', 'credits', 'rate', 'od', 'od-b', 'od-s', 'goal-l', 'goal-r', 'goal-s', 'goal-bar', 'panel', 'nav', 'overlay', 'devbadge'].forEach(function (id) { els[id] = $(id); });

    els.nav.addEventListener('click', function (e) {
      var b = e.target.closest('[data-tab]');
      if (b) SW.actions.tab(b.getAttribute('data-tab'));
    });
    els.od.addEventListener('click', function () { SW.actions.overdrive(); });
    els.panel.addEventListener('click', onPanelClick);
    els.overlay.addEventListener('click', function (e) {
      var b = e.target.closest('[data-sheet]');
      if (b) { var fn = U.sheetHandlers[b.getAttribute('data-sheet')]; if (fn) fn(e, b); }
    });
  };

  function onPanelClick(e) {
    var b = e.target.closest('button');
    if (!b) return;
    var d = b.dataset;
    if (d.buy) SW.actions.buyFactory(d.buy, b);
    else if (d.mode) SW.actions.mode(d.mode === 'max' ? 'max' : parseInt(d.mode, 10));
    else if (d.up) SW.actions.buyUpgrade(d.up, b);
    else if (d.sec) SW.actions.buySection(d.sec, b);
    else if (d.launch !== undefined) SW.actions.askLaunch();
    else if (d.set) SW.actions.setting(d.set);
    else if (d.reset !== undefined) SW.actions.askReset();
    else if (d.ver !== undefined) SW.actions.versionTap();
    else if (d.dev) SW.actions.dev(d.dev);
    else if (d.claim !== undefined) SW.actions.claimDrop(b);
    else if (d.sview) { G.stationView = d.sview; SW.audio.play('tap'); }
    else if (d.research) SW.actions.startResearch(d.research, b);
    else if (d.rig) SW.actions.moonBuy('rig', d.rig, b);
    else if (d.fusion !== undefined) SW.actions.moonBuy('fusion', null, b);
    else if (d.base) SW.actions.moonBuy('base', d.base, b);
    else if (d.auto) SW.actions.autoToggle(d.auto);
    else if (d.thr) SW.actions.threshold(parseInt(d.thr, 10));
    else if (d.expedition !== undefined) SW.actions.askExpedition(null);
    else if (d.mission) SW.actions.askExpedition(d.mission);
    else if (d.abandon !== undefined) SW.actions.abandonMission();
    else if (d.jump !== undefined) SW.actions.askJump();
  }

  // ---------- Overlay sheets ----------
  U.sheetHandlers = {};
  U.sheet = function (html, handlers) {
    U.sheetHandlers = handlers || {};
    els.overlay.innerHTML = '<div class="sheet" role="dialog" aria-modal="true">' + html + '</div>';
    void els.overlay.offsetWidth;
    els.overlay.classList.add('show');
  };
  U.closeSheet = function () {
    els.overlay.classList.remove('show');
    U.sheetHandlers = {};
    setTimeout(function () { if (!els.overlay.classList.contains('show')) els.overlay.innerHTML = ''; SW.actions.sheetClosed(); }, 260);
  };
  U.sheetOpen = function () { return els.overlay.classList.contains('show'); };
  U.oriSays = function (text) {
    return '<div class="who">' + A.ori(46) + '<div class="say"><b>Ori</b><p>' + text + '</p></div></div>';
  };

  var toastQ = [], toastBusy = false;
  U.toast = function (label, title, sub) {
    toastQ.push([label, title, sub]);
    if (!toastBusy) nextToast();
  };
  function nextToast() {
    var t = toastQ.shift();
    if (!t) { toastBusy = false; return; }
    toastBusy = true;
    var d = document.createElement('div');
    d.className = 'toast';
    d.innerHTML = '<span class="lbl">' + t[0] + '</span><b>' + t[1] + '</b><span class="d">' + t[2] + '</span>';
    document.body.appendChild(d);
    requestAnimationFrame(function () { requestAnimationFrame(function () { d.classList.add('show'); }); });
    setTimeout(function () { d.classList.remove('show'); }, 2600);
    setTimeout(function () { d.remove(); nextToast(); }, 3000);
  }

  U.pop = function (anchor, text) {
    if (!anchor) return;
    var r = anchor.getBoundingClientRect();
    var d = document.createElement('div');
    d.className = 'pop'; d.textContent = text;
    d.style.left = (r.left + r.width / 2 - 20) + 'px';
    d.style.top = (r.top - 6) + 'px';
    document.body.appendChild(d);
    setTimeout(function () { d.remove(); }, 950);
  };

  // ---------- Locks ----------
  function tabLocked(id) {
    var s = G.s;
    if (id === 'upgrades') return !E.shopUnlocked(s);
    if (id === 'rocket') return !E.rocketTabUnlocked(s);
    if (id === 'station') return s.launches === 0 && !(s.mars && s.mars.expeditions > 0);
    return false;
  }

  // ---------- Panel structure ----------
  function signature() {
    var s = G.s, parts = [G.tab, G.mode, s.settings.sci, s.settings.bestHint, s.dev.enabled, s.launches, tabLocked(G.tab)];
    if (G.tab === 'factories') parts.push(C().factories.map(function (f) { return E.isRevealed(s, f) ? 1 : 0; }).join(''));
    if (G.tab === 'upgrades') parts.push(E.shopList(s).map(function (u) { return u.id; }).join(','));
    if (G.tab === 'rocket') parts.push(s.rocket.join(','), SW.moon.has(s, 'driver'), s.moon.auto.launch, s.moon.auto.threshold);
    if (G.tab === 'station') parts.push(SW.kestrel.open(s), s.kestrel.built, s.kestrel.ended, s.kestrel.rank, SW.mars.open(s), s.mars.expeditions, s.mars.active, JSON.stringify(s.mars.done), s.moon.started, JSON.stringify(s.moon.base), JSON.stringify(s.moon.auto), C().moon.rigs.map(function (r, i) { return SW.moon.rigRevealed(s, r, i) ? 1 : 0; }).join(''), G.stationView, E.modules(s).length, s.research.active ? s.research.active.id + s.research.active.level : '-', JSON.stringify(s.research.levels));
    if (G.tab === 'more') parts.push(s.dev.speed, s.dev.income, s.daily.step, s.daily.last, SW.prog.dropReady(s), SW.prog.earnedCount(s),
      SW.prog.next(s, 3).map(function (x) { return x.a.id; }).join(','), s.settings.sound, s.settings.music);
    return parts.join('|');
  }

  U.rebuild = function () { panelSig = ''; };

  function buildPanel() {
    var s = G.s, h = '';
    rows = {};
    if (tabLocked(G.tab)) h = lockedHtml(G.tab);
    else if (G.tab === 'factories') h = factoriesHtml();
    else if (G.tab === 'upgrades') h = upgradesHtml();
    else if (G.tab === 'rocket') h = rocketHtml();
    else if (G.tab === 'station') h = stationHtml();
    else h = moreHtml();
    els.panel.innerHTML = h;
    els.panel.querySelectorAll('[data-row]').forEach(function (row) {
      var r = rows[row.getAttribute('data-row')] = { el: row };
      row.querySelectorAll('[data-r]').forEach(function (x) { r[x.getAttribute('data-r')] = x; });
    });
    TABS.forEach(function (t) { cls($('tab-' + t.id), 'on', t.id === G.tab); });
    if (G.tab === 'station' && !tabLocked('station')) paintStation();
  }

  function lockedHtml(tab) {
    var s = G.s, title, text;
    if (tab === 'upgrades') { title = 'Upgrade shop'; text = 'Opens once you\'ve earned ' + fmt(E.allUpgrades()[0].cost * 0.5) + ' credits.'; }
    if (tab === 'rocket') { title = 'Rocket program'; text = 'Earn ' + fmt(C().rocketTabAt) + ' credits to start building your first rocket.'; }
    if (tab === 'station') { title = 'Harbor Station'; text = 'Launch your first rocket. The payload it carries becomes the start of a space station.'; }
    return '<div class="card locked-panel">' + A.icon('lock') + '<h3>' + title + '</h3><p>' + text + '</p></div>';
  }

  function ringSvg() {
    return '<svg class="rg" viewBox="0 0 60 60" aria-hidden="true"><circle class="rg-bg" cx="30" cy="30" r="26.5"/>' +
      '<circle class="rg-fg" data-r="ring" cx="30" cy="30" r="26.5" stroke-dasharray="166.5" stroke-dashoffset="166.5" transform="rotate(-90 30 30)"/></svg>';
  }
  function factoriesHtml() {
    var s = G.s, h = '<div class="sh-head"><h2>Factories</h2><div class="pills" role="group" aria-label="Buy amount">';
    [[1, '×1'], [10, '×10'], [100, '×100'], ['max', 'Max']].forEach(function (m) {
      h += '<button data-mode="' + m[0] + '" class="' + (G.mode === m[0] ? 'on' : '') + '">' + m[1] + '</button>';
    });
    h += '</div></div>';
    var teaser = null;
    C().factories.forEach(function (f) {
      if (!E.isRevealed(s, f)) { if (!teaser) teaser = f; return; }
      h += '<div class="card fac" data-row="' + f.id + '">' +
        '<div class="rt">' + ringSvg() + '<div class="tile">' + SW.art2.icon(f.icon, 26) + '</div><span class="cnt tnum" data-r="count"></span></div>' +
        '<div class="mid"><div class="t">' + f.name + '</div>' +
        '<div class="s"><span class="bv" data-r="bv" hidden>Best value · </span><span data-r="share"></span></div>' +
        '<div class="pr"><div class="mseg" data-r="ticks">' + new Array(11).join('<b></b>') + '</div><span class="ms" data-r="ms"></span></div></div>' +
        '<button class="buy" data-buy="' + f.id + '"><small data-r="gain" class="tnum"></small><b data-r="cost" class="tnum"></b></button></div>';
    });
    if (teaser) {
      h += '<div class="card fac locked" data-row="teaser"><div class="rt"><svg class="rg" viewBox="0 0 60 60" aria-hidden="true"><circle class="rg-bg dash" cx="30" cy="30" r="26.5"/></svg>' +
        '<div class="tile ghost">' + SW.art2.icon(teaser.icon, 26) + '</div></div>' +
        '<div class="mid"><div class="t">' + teaser.name + '</div><div class="s" data-r="text"></div></div></div>';
      G.teaser = teaser;
    } else G.teaser = null;
    return h;
  }

  function upgradesHtml() {
    var s = G.s, list = E.shopList(s), owned = Object.keys(s.upgrades).length;
    var h = '<div class="panel-head"><h2>Upgrades</h2><span>' + owned + ' bought this run</span></div>';
    if (!list.length) h += '<div class="card locked-panel"><h3>All caught up</h3><p>Buy more kinds of factories to unlock more upgrades.</p></div>';
    list.forEach(function (u) {
      h += '<div class="card row-card" data-row="u-' + u.id + '"><div class="txt"><span class="t">' + u.name + '</span><span class="d">' + u.desc + '</span></div>' +
        '<button class="btn" data-up="' + u.id + '" data-r="btn"><span class="tnum">' + fmt(u.cost) + '</span></button></div>';
    });
    h += '<p class="note">Upgrades last until your next launch. The cheapest ' + C().shopShows + ' are shown.</p>';
    return h;
  }

  function driverHtml() {
    var s = G.s, a = s.moon.auto;
    var h = '<div class="panel-head"><h2>Mass Driver</h2><span>Launch #' + (s.launches + 1) + '</span></div>';
    h += '<div class="card row-card"><div class="txt"><span class="t">Auto-launch</span><span class="d">Launches by itself once a launch would add at least ' + a.threshold + '% to your payload.</span></div>' +
      '<button class="toggle' + (a.launch ? ' on' : '') + '" data-auto="launch" aria-pressed="' + a.launch + '" aria-label="Auto-launch"></button></div>';
    h += '<div class="seg" style="position:static">' + C().moon.thresholds.map(function (t) {
      return '<button data-thr="' + t + '" class="' + (a.threshold === t ? 'on' : '') + '">+' + t + '%</button>';
    }).join('') + '</div>';
    h += '<div class="stat-grid" data-row="payload">' +
      '<div><span>In orbit</span><b class="tnum" data-r="orbit"></b></div>' +
      '<div><span>Income bonus</span><b class="tnum" data-r="bonus"></b></div>' +
      '<div><span>This launch</span><b class="tnum" data-r="gain"></b></div>' +
      '<div><span>Auto-launch at</span><b class="tnum" data-r="next"></b></div></div>';
    h += '<button class="big-btn" data-launch data-row="launch" data-r="btn">Launch now<small data-r="sub"></small></button>';
    h += '<p class="note">The Mass Driver replaces rockets: it flings payload into orbit straight from the Moon. Launching still restarts your factories, credits and upgrades.</p>';
    return h;
  }

  function rocketHtml() {
    var s = G.s, next = E.nextSection(s);
    if (SW.moon.has(s, 'driver')) return driverHtml();
    var h = '<div class="panel-head"><h2>' + E.rocketName(s) + '</h2><span>Launch #' + (s.launches + 1) + '</span></div>';
    C().rocketSections.forEach(function (sec) {
      var built = s.rocket.indexOf(sec.id) >= 0, isNext = next && next.id === sec.id;
      h += '<div class="card row-card" data-row="sec-' + sec.id + '"><div class="txt"><span class="t">' + sec.name + '</span>' +
        '<span class="d tnum">' + (built ? 'Built' : fmt(E.sectionCost(s, sec)) + ' credits') + '</span></div>';
      if (built) h += '<span class="status">BUILT</span>';
      else if (isNext) h += '<button class="btn hot" data-sec="' + sec.id + '" data-r="btn">Build</button>';
      else h += '<span class="status wait">NEXT UP</span>';
      h += '</div>';
    });
    h += '<div class="stat-grid" data-row="payload">' +
      '<div><span>In orbit</span><b class="tnum" data-r="orbit"></b></div>' +
      '<div><span>Income bonus</span><b class="tnum" data-r="bonus"></b></div>' +
      '<div><span>This launch</span><b class="tnum" data-r="gain"></b></div>' +
      '<div><span>Next tonne in</span><b class="tnum" data-r="next"></b></div></div>';
    h += '<button class="big-btn" data-launch data-row="launch" data-r="btn">Launch<small data-r="sub"></small></button>';
    h += '<p class="note">Launching restarts your factories, credits, upgrades and rocket. Payload stays in orbit for good, and each tonne adds +' + Math.round(E.perTonne(G.s) * 100) + '% income.</p>';
    return h;
  }

  function stationHtml() {
    var s = G.s, mods = C().stationModules, built = E.modules(s).length, next = E.nextModule(s);
    var h = '<div class="panel-head"><h2>Harbor Station</h2><span class="tnum">' + fmt(s.payload) + ' t in orbit</span></div>';
    var marsView = G.stationView === 'mars' && (s.moon.started || s.mars.expeditions);
    var kesView = G.stationView === 'kestrel' && SW.kestrel.open(s);
    h += '<div class="stn-art' + (kesView && s.kestrel.ended ? ' drifting' : '') + '" id="stn-art">' + (kesView ? A.kestrel() : marsView ? A.mars() : G.stationView === 'moon' && s.moon.started ? A.moon() : A.station()) + '</div>';
    h += '<div class="seg"><button data-sview="modules" class="' + (G.stationView === 'modules' ? 'on' : '') + '">Station</button>' +
      '<button data-sview="research" class="' + (G.stationView === 'research' ? 'on' : '') + '">Research</button>' +
      (s.moon.started ? '<button data-sview="moon" class="' + (G.stationView === 'moon' ? 'on' : '') + '">Moon</button>' : '') +
      (s.moon.started || s.mars.expeditions ? '<button data-sview="mars" class="' + (G.stationView === 'mars' ? 'on' : '') + '">Mars</button>' : '') +
      (SW.kestrel.open(s) ? '<button data-sview="kestrel" class="' + (G.stationView === 'kestrel' ? 'on' : '') + '">Kestrel</button>' : '') + '</div>';
    if (kesView) {
      h += kestrelHtml();
    } else if (marsView) {
      h += marsHtml();
    } else if (G.stationView === 'moon' && s.moon.started) {
      h += moonHtml();
    } else if (G.stationView === 'modules') {
      if (next) {
        h += '<div class="card row-card" data-row="next"><div class="txt"><span class="lbl" style="margin:0">Next module</span><span class="t">' + next.name + '</span><span class="d">' + next.text + '</span>' +
          '<div class="bar o"><i data-r="bar"></i></div></div><span class="status wait tnum" data-r="amt"></span></div>';
      } else {
        h += '<p class="note">Every module is online. The Observatory has the Moon in view. The Moon base arrives in a future build.</p>';
      }
      mods.forEach(function (m) {
        var on = s.payload >= m.at;
        if (!on && m !== next) return;
        if (m === next) return;
        h += '<div class="card row-card"><div class="txt"><span class="t">' + m.name + '</span><span class="d">' + m.text + '</span></div><span class="status">ONLINE</span></div>';
      });
      var later = mods.filter(function (m) { return s.payload < m.at && m !== next; });
      if (later.length) h += '<p class="note">' + later.length + ' more module' + (later.length > 1 ? 's' : '') + ' after that. Dashed outlines in the picture show where they go.</p>';
    } else {
      h += researchHtml();
    }
    return h;
  }

  function researchHtml() {
    var s = G.s, a = s.research.active;
    if (!E.researchOpen(s)) {
      var lab = C().stationModules.filter(function (m) { return m.id === 'lab'; })[0];
      return '<div class="card locked-panel">' + A.icon('lock') + '<h3>Research Lab</h3><p>Comes online at ' + fmt(lab.at) + ' t of payload. Research projects run in real time, even while you\'re away.</p></div>';
    }
    var h = '';
    if (a) {
      var r = E.researchTrack(a.id);
      h += '<div class="card res-active" data-row="active"><div class="top-row"><span class="t">' + r.name + ' <span class="lvl">LEVEL ' + a.level + '</span></span><span class="left tnum" data-r="left"></span></div>' +
        '<span class="d">' + E.researchText(r, a.level) + '</span><div class="bar o"><i data-r="bar"></i></div></div>';
    } else {
      h += '<p class="note">Pick a project. Only one runs at a time, and it keeps going while you\'re away.</p>';
    }
    C().research.forEach(function (r) {
      var lvl = E.researchLevel(s, r.id), max = r.hours.length, done = lvl >= max, running = a && a.id === r.id;
      if (running) return;
      var pips = '<span class="pips">' + r.hours.map(function (x, i) { return '<i class="' + (i < lvl ? 'f' : '') + '"></i>'; }).join('') + '</span>';
      h += '<div class="card row-card"><div class="txt"><span class="t">' + r.name + pips + '</span>' +
        '<span class="d">' + (done ? E.researchText(r, lvl) : 'Next: ' + E.researchText(r, lvl + 1) + ' · ' + SW.fmtDuration(E.researchDuration(r, lvl))) + '</span></div>' +
        (done ? '<span class="status">COMPLETE</span>' : '<button class="btn' + (a ? '' : ' ok hot') + '" data-research="' + r.id + '">Start</button>') + '</div>';
    });
    return h;
  }

  function moonHtml() {
    var s = G.s, M = SW.moon, mc = C().moon;
    var h = '<div class="card he3" data-row="he3"><div><span class="lbl">Helium-3</span><b class="tnum" data-r="amt"></b></div>' +
      '<div class="he3-rate"><b class="tnum" data-r="rate"></b><span>Mines while you\'re away, up to ' + mc.awayCapHours + ' h</span></div></div>';
    h += '<div class="card row-card fusion" data-row="fusion"><div class="txt"><span class="t">Fusion Reactor <span class="lvl" data-r="lvl"></span></span>' +
      '<span class="d" data-r="d"></span></div><button class="btn" data-fusion data-r="btn"><span class="tnum" data-r="cost"></span></button></div>';
    h += '<div class="panel-head"><h2>Mining rigs</h2></div>';
    mc.rigs.forEach(function (r, i) {
      if (!M.rigRevealed(s, r, i)) return;
      h += '<div class="card row-card" data-row="rig-' + r.id + '"><div class="txt"><span class="t">' + r.name + ' <em class="tnum lvl" data-r="count"></em></span>' +
        '<span class="d tnum" data-r="d"></span></div><button class="btn" data-rig="' + r.id + '" data-r="btn"><span class="tnum" data-r="cost"></span></button></div>';
    });
    h += '<div class="panel-head"><h2>Base</h2></div>';
    mc.base.forEach(function (b) {
      var own = M.has(s, b.id), ctl;
      if (!own) ctl = '<button class="btn" data-base="' + b.id + '" data-r="btn">' + fmt(b.cost) + ' He-3</button>';
      else if (b.id === 'foreman' || b.id === 'quarter') {
        var key = b.id === 'foreman' ? 'buy' : 'upgrades';
        ctl = '<button class="toggle' + (s.moon.auto[key] ? ' on' : '') + '" data-auto="' + key + '" aria-pressed="' + s.moon.auto[key] + '" aria-label="' + b.name + '"></button>';
      } else ctl = '<span class="status">ONLINE</span>';
      h += '<div class="card row-card" data-row="base-' + b.id + '"><div class="txt"><span class="t">' + b.name + '</span><span class="d">' + b.text + '</span></div>' + ctl + '</div>';
    });
    h += '<p class="note">Mars is next. It arrives in a future build.</p>';
    return h;
  }

  function marsHtml() {
    var s = G.s, R = SW.mars, mc = C().mars, m = s.mars;
    var h = '<div class="card he3" data-row="col"><div><span class="lbl">Colonists</span><b class="tnum">' + fmt(m.colonists) + '</b></div>' +
      '<div class="he3-rate"><b class="tnum">income ×' + fmt(R.incomeMult(s)) + '</b><span>Moon mining ×' + fmt(R.miningMult(s)) + '. Colonists stay through every reset.</span></div></div>';
    if (!R.open(s)) {
      h += '<div class="card locked-panel">' + A.icon('lock') + '<h3>First expedition</h3><p>Reach Fusion level ' + mc.unlockFusion + ' on the Moon to plan an expedition to Mars.</p></div>';
      return h;
    }
    if (m.active) {
      var am = R.mission(m.active);
      h += '<div class="card res-active" data-row="mission"><div class="top-row"><span class="t">Mission: ' + am.name + '</span><span class="left tnum" data-r="left"></span></div>' +
        '<span class="d">' + am.twist + ' Reward: ' + am.perk + '</span><div class="bar o"><i data-r="bar"></i></div>' +
        '<button class="btn plain" data-abandon style="align-self:flex-start">Abandon mission</button></div>';
    }
    h += '<div class="card row-card" data-row="exp"><div class="txt"><span class="t">Expedition</span><span class="d" data-r="d"></span></div>' +
      '<button class="btn" data-expedition data-r="btn">Plan</button></div>';
    h += '<p class="note">An expedition starts everything over: factories, payload, the station and the Moon. You keep colonists, research, achievements, Overdrive and Supply Drops.</p>';
    if (m.expeditions > 0) {
      h += '<div class="panel-head"><h2>Missions</h2><span>' + Object.keys(m.done).length + ' / ' + mc.missions.length + ' done</span></div>';
      mc.missions.forEach(function (x) {
        var done = m.done[x.id], act = m.active === x.id;
        h += '<div class="card row-card"><div class="txt"><span class="t">' + x.name + '</span><span class="d">' + x.twist + ' Goal: ' + fmt(x.goal) + ' t payload.</span>' +
          '<span class="d" style="color:var(--orange-soft)">' + x.perk + '</span></div>' +
          (done ? '<span class="status">DONE</span>' : act ? '<span class="status" style="color:var(--orange)">ACTIVE</span>' : '<button class="btn ok" data-mission="' + x.id + '">Start</button>') + '</div>';
      });
    }
    if (!SW.kestrel.open(s)) h += '<p class="note">At ' + C().kestrel.unlockColonists + ' colonists, expeditions start bringing home pieces of Kestrel, the starship.</p>';
    return h;
  }

  function kestrelHtml() {
    var s = G.s, K = SW.kestrel, kc = C().kestrel, k = s.kestrel, h = '';
    if (!k.ended) {
      var nx = K.next(s);
      h += '<div class="card he3"><div><span class="lbl">Kestrel</span><b class="tnum">' + k.built + ' / ' + kc.segments.length + '</b></div>' +
        '<div class="he3-rate"><b>segments in orbit</b><span>Every expedition that lands a colonist brings home the next segment.</span></div></div>';
      if (nx) h += '<div class="card row-card"><div class="txt"><span class="lbl" style="margin:0">Next segment</span><span class="t">' + nx.name + '</span><span class="d">' + nx.text + '</span></div></div>';
      kc.segments.slice(0, k.built).reverse().forEach(function (seg) {
        h += '<div class="card row-card"><div class="txt"><span class="t">' + seg.name + '</span><span class="d">' + seg.text + '</span></div><span class="status">ONLINE</span></div>';
      });
      return h;
    }
    var sys = k.system, tw = sys.twist ? C().mars.missions.filter(function (m) { return m.id === sys.twist; })[0] : null;
    h += '<div class="card he3"><div><span class="lbl">Star rank</span><b class="tnum">' + k.rank + '</b></div>' +
      '<div class="he3-rate"><b class="tnum">' + fmt(k.ly) + ' lightyears</b><span>Each rank: all income ×' + kc.rankIncome + ', forever.</span></div></div>';
    h += '<div class="card res-active" data-row="sys"><div class="top-row"><span class="t">' + sys.name + '</span><span class="left tnum" data-r="left"></span></div>' +
      '<span class="d">' + sys.bonus.text + (tw ? ' Twist: ' + tw.twist : ' No twist here.') + '</span>' +
      '<div class="bar o"><i data-r="bar"></i></div></div>';
    h += '<button class="big-btn" data-jump data-row="jump" data-r="btn">Jump to the next star<small data-r="sub"></small></button>';
    h += '<p class="note">A jump works like an expedition: everything starts over and new colonists land as usual, then Kestrel arrives at a new star with its own bonus and twist.</p>';
    return h;
  }

  function paintKestrel() {
    var s = G.s;
    for (var i = 0; i < 12; i++) { var el = document.getElementById('kseg-' + i); if (el) cls(el, 'on', i < s.kestrel.built); }
  }

  function updateKestrel() {
    var s = G.s, k = s.kestrel, r = rows.sys, j = rows.jump;
    if (!k.ended || !r) return;
    var goal = k.system.goal;
    r.bar.style.transform = 'scaleX(' + Math.min(1, s.payload / goal).toFixed(3) + ')';
    setText(r.left, fmt(s.payload) + ' / ' + fmt(goal) + ' t');
    if (j) {
      var ok = SW.kestrel.canJump(s);
      j.el.disabled = !ok;
      setText(j.sub, ok ? k.system.distance + ' lightyears to the next star' : 'Reach ' + fmt(goal) + ' t of payload in this system first');
    }
  }

  function paintMars() {
    var s = G.s;
    A.marsDomes.forEach(function (t, i) { var el = document.getElementById('dome-' + i); if (el) cls(el, 'on', s.mars.colonists >= t); });
  }

  function updateMars() {
    var s = G.s, R = SW.mars, e = rows.exp, mi = rows.mission;
    if (e) {
      var g = R.gain(s);
      setText(e.d, g > 0 ? 'Lands +' + fmt(g) + ' colonists now. Next one at ' + fmt(R.payloadForNext(s)) + ' t payload.'
        : 'No new colonists yet. The next one needs ' + fmt(R.payloadForNext(s)) + ' t of payload.');
      cls(e.btn, 'ok', g > 0); cls(e.btn, 'hot', g > 0);
    }
    if (mi && s.mars.active) {
      var goal = R.mission(s.mars.active).goal;
      mi.bar.style.transform = 'scaleX(' + Math.min(1, s.payload / goal).toFixed(3) + ')';
      setText(mi.left, fmt(s.payload) + ' / ' + fmt(goal) + ' t');
    }
  }

  function paintMoon() {
    var s = G.s, M = SW.moon;
    C().moon.rigs.forEach(function (r) { var el = document.getElementById('rig-' + r.id); if (el) cls(el, 'on', M.rigCount(s, r.id) > 0); });
    cls(document.getElementById('moon-driver'), 'on', M.has(s, 'driver'));
    cls(document.getElementById('moon-fusion'), 'on', s.moon.fusion > 0);
    var g = document.getElementById('fusion-glow');
    if (g) g.style.opacity = Math.min(0.9, 0.25 + s.moon.fusion * 0.05).toFixed(2);
  }

  function updateMoon() {
    var s = G.s, M = SW.moon, he = s.moon.he3;
    var r = rows.he3;
    if (r) { setText(r.amt, fmt(he)); setText(r.rate, '+' + fmt(M.rate(s) * 3600) + ' / hour'); }
    var f = rows.fusion;
    if (f) {
      var c = M.fusionCost(s);
      setText(f.lvl, 'LEVEL ' + s.moon.fusion);
      setText(f.d, 'All income ×' + fmt(M.fusionMult(s)) + ' · mining ×' + fmt(M.miningMult(s)) + '. Next level doubles income again.');
      setText(f.cost, fmt(c) + ' He-3');
      cls(f.btn, 'ok', he >= c); cls(f.btn, 'hot', he >= c);
    }
    C().moon.rigs.forEach(function (rg) {
      var x = rows['rig-' + rg.id]; if (!x) return;
      var n = M.rigCount(s, rg.id), c = M.rigCost(rg, n, 1);
      setText(x.count, n ? String(n) : '');
      setText(x.d, '+' + fmt(M.rigRate(s, rg, 1) * 3600) + ' He-3 / hour each');
      setText(x.cost, fmt(c) + ' He-3');
      cls(x.btn, 'ok', he >= c);
    });
    C().moon.base.forEach(function (b) {
      var x = rows['base-' + b.id]; if (!x || !x.btn) return;
      cls(x.btn, 'ok', he >= b.cost); cls(x.btn, 'hot', he >= b.cost);
    });
    if (G.moonPaint !== s.moon.fusion + JSON.stringify(s.moon.rigs)) { G.moonPaint = s.moon.fusion + JSON.stringify(s.moon.rigs); paintMoon(); }
  }

  function paintStation() {
    var s = G.s;
    if (G.stationView === 'kestrel') { paintKestrel(); return; }
    if (G.stationView === 'mars') { paintMars(); return; }
    if (G.stationView === 'moon' && s.moon.started) { G.moonPaint = null; paintMoon(); return; }
    E.modules(s).forEach(function (m) {
      var el = document.getElementById('mod-' + m.id);
      if (!el) return;
      el.classList.add('on');
      if (G.freshModule === m.id) { el.classList.add('fresh'); G.freshModule = null; }
    });
  }

  function moreHtml() {
    var s = G.s;
    var h = dropHtml() + achHtml() + '<div class="panel-head"><h2>Logbook</h2></div>';
    h += '<div class="stat-grid" data-row="stats">' +
      '<div><span>Earned, all time</span><b class="tnum" data-r="total"></b></div>' +
      '<div><span>Launches</span><b class="tnum" data-r="launches"></b></div>' +
      '<div><span>Payload in orbit</span><b class="tnum" data-r="payload"></b></div>' +
      '<div><span>Time played</span><b class="tnum" data-r="time"></b></div></div>';
    h += '<div class="panel-head"><h2>Settings</h2></div>';
    h += settingRow('sound', 'Sound effects', 'Soft clicks and chimes.');
    h += settingRow('music', 'Music', 'Warm on Earth, quiet in space.');
    h += settingRow('sci', 'Scientific notation', 'Show 1.23e15 instead of 1.23 Qa.');
    h += settingRow('bestHint', 'Best value hint', 'Outline the purchase that adds the most income for its price.');
    h += '<div class="card row-card"><div class="txt"><span class="t">Overdrive</span><span class="d">Time away charges it, up to ' + E.overdriveCapHours(G.s) + ' hours. Tap the pill at the top for ×' + E.overdriveMult(G.s) + '.</span></div></div>';
    h += '<button class="ghost-btn danger" data-reset>Reset all progress</button>';
    if (s.dev.enabled) h += devHtml();
    h += '<button class="version" data-ver>STARWRIGHT v' + C().version + '</button>';
    return h;
  }
  function dropHtml() {
    var s = G.s, P = SW.prog, ready = P.dropReady(s), step = ready ? P.dropStep(s) : s.daily.step;
    var days = C().dailyDrops.map(function (d, i) {
      var c = i < step ? 'done' : i === step ? (ready ? 'now' : 'next') : '';
      return '<span class="' + c + '"><b>' + (i + 1) + '</b>' + (d.income && d.overdrive ? 'Both' : d.income ? 'Income' : 'OD') + '</span>';
    }).join('');
    return '<div class="card drop' + (ready ? ' ready' : '') + '" data-row="drop">' +
      '<div class="drop-head"><div class="txt"><span class="lbl">Daily Supply Drop</span><b data-r="title"></b></div>' +
      (ready ? '<button class="btn ok hot" data-claim>Open</button>' : '<span class="status wait">TOMORROW</span>') + '</div>' +
      '<div class="drop-days">' + days + '</div><p class="d" data-r="sub"></p></div>';
  }
  function achHtml() {
    var s = G.s, P = SW.prog, all = P.achievements(), n = P.earnedCount(s);
    var h = '<div class="panel-head"><h2>Achievements</h2><span class="tnum">' + n + ' / ' + all.length + ' · +' + Math.round(n * C().achievementBonus * 100) + '% income</span></div>';
    P.next(s, 3).forEach(function (x) {
      h += '<div class="card row-card ach" data-row="a-' + x.a.id + '"><div class="txt"><span class="t">' + x.a.name + '</span><span class="d">' + x.a.desc + '</span>' +
        '<div class="bar"><i data-r="bar"></i></div></div><span class="status wait tnum" data-r="pct"></span></div>';
    });
    var hidden = all.length - n - Math.min(3, all.length - n);
    if (hidden > 0) h += '<p class="note">' + hidden + ' more to discover. Each one adds +' + Math.round(C().achievementBonus * 100) + '% income, forever.</p>';
    if (n) {
      h += '<div class="chips">' + all.filter(function (a) { return s.ach[a.id]; }).map(function (a) { return '<span>' + A.icon('check') + a.name + '</span>'; }).join('') + '</div>';
    }
    return h;
  }
  function settingRow(key, title, desc) {
    return '<div class="card row-card"><div class="txt"><span class="t">' + title + '</span><span class="d">' + desc + '</span></div>' +
      '<button class="toggle' + (G.s.settings[key] ? ' on' : '') + '" data-set="' + key + '" aria-pressed="' + !!G.s.settings[key] + '" aria-label="' + title + '"></button></div>';
  }
  function devHtml() {
    var d = G.s.dev;
    function b(id, label) { return '<button class="btn ok plain" data-dev="' + id + '">' + label + '</button>'; }
    return '<div class="panel-head"><h2 style="color:var(--orange)">Dev menu</h2><span>remove before publishing</span></div>' +
      '<div class="card" style="padding:12px;display:flex;flex-wrap:wrap;gap:8px">' +
      b('hour', '+1 h income') + b('x100', 'Credits ×100') + b('away', 'Away 1 h') + b('away8', 'Away 8 h') +
      b('od', '+1 h Overdrive') + b('payload', '+10 t payload') + b('rocket', 'Finish rocket') +
      b('speed', 'Speed ×' + d.speed) + b('income', 'Income ×' + d.income) + b('research', 'Finish research') + b('he3', 'Helium-3 ×10') + b('mars', 'Open Mars') + b('kestrel', '+1 Kestrel segment') + b('tips', 'Replay tips') + b('off', 'Hide dev menu') +
      '</div>';
  }

  // ---------- Per-frame update ----------
  U.update = function (now) {
    var s = G.s;
    var sig = signature();
    if (sig !== panelSig) { panelSig = sig; buildPanel(); }
    updateBars();
    if (now - lastText < 100) return;
    lastText = now;
    updateHeader();
    updateScene();
    updateNav();
    if (tabLocked(G.tab)) return;
    if (G.tab === 'factories') updateFactories();
    else if (G.tab === 'upgrades') updateUpgrades();
    else if (G.tab === 'rocket') updateRocket();
    else if (G.tab === 'more') updateMore();
    else if (G.tab === 'station') updateStation();
  };

  function updateStation() {
    var s = G.s, n = rows.next, a = rows.active, nx = E.nextModule(s);
    if (G.stationView === 'kestrel') { updateKestrel(); return; }
    if (G.stationView === 'mars') { updateMars(); return; }
    if (G.stationView === 'moon' && s.moon.started) { updateMoon(); return; }
    if (n && nx) {
      n.bar.style.transform = 'scaleX(' + Math.min(1, s.payload / nx.at).toFixed(3) + ')';
      setText(n.amt, fmt(s.payload) + ' / ' + fmt(nx.at) + ' t');
    }
    var act = s.research.active;
    if (a && act) {
      var now = Date.now(), frac = Math.min(1, (now - act.start) / (act.end - act.start));
      a.bar.style.transform = 'scaleX(' + frac.toFixed(4) + ')';
      setText(a.left, SW.fmtClock((act.end - now) / 1000) + ' left');
    }
  }

  function updateBars() {
    if (G.tab !== 'factories') return;
    var s = G.s;
    C().factories.forEach(function (f) {
      var r = rows[f.id]; if (!r) return;
      var st = s.factories[f.id];
      var fast = st.count > 0 && E.factoryCycle(f, st.count) / s.dev.speed < 0.3;
      cls(r.el, 'fast', fast);
      if (!fast) r.ring.setAttribute('stroke-dashoffset', (166.5 * (1 - (st.count ? st.progress : 0))).toFixed(1));
    });
  }

  function updateHeader() {
    var s = G.s, rate = E.totalRate(s), on = E.overdriveOn(s);
    var cs = fmt(s.credits), sp = cs.lastIndexOf(' ');
    var ch = sp > 0 ? cs.slice(0, sp) + '<span>' + cs.slice(sp + 1) + '</span>' : cs;
    if (els.credits.innerHTML !== ch) els.credits.innerHTML = ch;
    var rh = '+' + fmt(rate) + '/s' + (on ? ' <b>· ×' + E.overdriveMult(G.s) + '</b>' : '');
    if (els.rate.innerHTML !== rh) els.rate.innerHTML = rh;
    var st = s.overdrive.stored;
    cls(els.od, 'has', st > 0);
    cls(els.od, 'on', on);
    setText(els['od-b'], on ? '×' + E.overdriveMult(G.s) + ' on' : 'Overdrive');
    setText(els['od-s'], SW.fmtClock(st) + (on ? ' left' : st > 0 ? ' ready' : ''));
    els.devbadge.hidden = !s.dev.enabled;

    var label, right, frac, sub;
    if (SW.moon.has(s, 'driver')) {
      var tg = SW.moon.autoTarget(s), gn = E.payloadGain(s);
      label = 'Mass Driver'; sub = s.moon.auto.launch ? 'Auto-launch at +' + fmt(tg) + ' t' : 'Auto-launch off';
      frac = gn / tg; right = '+' + fmt(gn) + ' t';
    } else if (!E.rocketTabUnlocked(s)) {
      label = 'Rocket program'; sub = 'Earn ' + fmt(C().rocketTabAt) + ' to begin'; frac = s.runEarned / C().rocketTabAt; right = Math.floor(Math.min(1, frac) * 100) + '%';
    } else if (!E.rocketReady(s)) {
      var sec = E.nextSection(s), cost = E.sectionCost(s, sec);
      label = sec.name; sub = E.rocketName(s) + ' · section ' + (s.rocket.length + 1) + ' of 4'; frac = s.credits / cost; right = Math.floor(Math.min(1, frac) * 100) + '%';
    } else {
      var g = E.payloadGain(s);
      label = 'Ready to launch'; sub = E.rocketName(s) + (g > 0 ? ' · +' + fmt(g) + ' t payload' : ''); frac = 1; right = '';
    }
    setText(els['goal-l'], label);
    setText(els['goal-s'], sub);
    setText(els['goal-r'], right);
    els['goal-bar'].style.transform = 'scaleX(' + Math.min(1, frac).toFixed(3) + ')';
  }

  var sceneKey = '';
  function updateScene() {
    var s = G.s;
    if (G.launching) return;
    var owned = C().factories.map(function (f) { return s.factories[f.id].count > 0; });
    var built = SW.moon.has(s, 'driver') ? 4 : s.rocket.length;
    var opts = { station: s.launches > 0 || s.payload > 0, moonLight: !!(s.moon && s.moon.started), marsDot: s.mars.expeditions > 0 };
    var key = owned.join('') + built + JSON.stringify(opts);
    if (key === sceneKey) return;
    sceneKey = key;
    els.world.innerHTML = SW.art2.yard(390, 430, owned, built, opts);
  }
  U.redrawScene = function () { sceneKey = ''; };

  function updateNav() {
    var s = G.s;
    TABS.forEach(function (t) {
      var b = $('tab-' + t.id), locked = tabLocked(t.id), alert = false;
      cls(b, 'lock', locked);
      if (!locked && t.id === 'upgrades') alert = E.shopList(s).some(function (u) { return u.cost <= s.credits; });
      if (!locked && t.id === 'rocket') {
        var nx = E.nextSection(s);
        alert = nx ? s.credits >= E.sectionCost(s, nx) : E.payloadGain(s) > 0;
      }
      if (t.id === 'more') alert = SW.prog.dropReady(s);
      if (t.id === 'station' && !locked) alert = E.researchOpen(s) && !s.research.active && E.researchNext(s).length > 0;
      cls(b, 'alert', alert && t.id !== G.tab);
      cls(b, 'pulse', !!G.pulse[t.id] && t.id !== G.tab);
    });
  }

  function updateFactories() {
    var s = G.s, total = E.totalRate(s), best = s.settings.bestHint ? E.bestValue(s, G.mode) : null;
    var odm = E.overdriveOn(s) ? E.overdriveMult(G.s) : 1;
    C().factories.forEach(function (f) {
      var r = rows[f.id]; if (!r) return;
      var c = E.factoryCount(s, f.id), k = E.buyCount(s, f, G.mode), cost = E.costFor(f, c, k);
      var ok = cost <= s.credits;
      setText(r.count, c ? String(c) : '0');
      r.bv.hidden = best !== f.id;
      cls(r.el, 'best', best === f.id);
      cls(r.el, 'none', !c);
      cls(r.el.querySelector('.buy'), 'ok', ok);
      cls(r.el.querySelector('.buy'), 'hot', ok && best === f.id);
      setText(r.gain, (k > 1 ? '×' + k + ' · ' : '') + '+' + fmt(E.deltaRate(s, f, k) * odm) + '/s');
      setText(r.cost, fmt(cost));
      var rate = E.factoryRate(s, f);
      setText(r.share, c ? Math.round(total ? rate / total * 100 : 0) + '% of income' : 'Not built yet');
      var nxt = E.nextMilestone(c), prev = E.prevMilestone(c), need = nxt - c;
      setText(r.ms, '×2 ' + E.nextMilestoneKind(f, c) + ' in ' + need);
      cls(r.ms, 'near', need <= Math.max(2, Math.ceil((nxt - prev) * 0.1)));
      var filled = Math.floor((c - prev) / (nxt - prev) * 10);
      var ticks = r.ticks.children;
      for (var i = 0; i < 10; i++) { cls(ticks[i], 'f', i < filled); cls(ticks[i], 'n', i === 9 && filled < 10); }
    });
    if (G.teaser && rows.teaser) {
      var need = G.teaser.cost * C().revealAt - C().factories[0].cost - s.runEarned;
      setText(rows.teaser.text, 'Unlocks after ' + fmt(Math.max(0, need)) + ' more credits earned');
    }
  }

  function updateUpgrades() {
    var s = G.s;
    E.shopList(s).forEach(function (u) {
      var r = rows['u-' + u.id]; if (!r) return;
      cls(r.btn, 'ok', u.cost <= s.credits);
      cls(r.btn, 'hot', u.cost <= s.credits);
    });
  }

  function updateRocket() {
    var s = G.s, nx = E.nextSection(s);
    if (nx && rows['sec-' + nx.id] && rows['sec-' + nx.id].btn) cls(rows['sec-' + nx.id].btn, 'ok', s.credits >= E.sectionCost(s, nx));
    var p = rows.payload, g = E.payloadGain(s), b = E.perTonne(G.s);
    if (p) {
      setText(p.orbit, fmt(s.payload) + ' t');
      setText(p.bonus, '+' + fmt(Math.round(s.payload * b * 100)) + '%');
      setText(p.gain, '+' + fmt(g) + ' t');
      setText(p.next, fmt(E.creditsToNextTonne(s)));
    }
    var l = rows.launch;
    if (l && SW.moon.has(s, 'driver')) {
      setText(p.next, '+' + fmt(SW.moon.autoTarget(s)) + ' t');
      l.el.disabled = g <= 0;
      setText(l.sub, g <= 0 ? 'Earn ' + fmt(E.creditsToNextTonne(s)) + ' more for the next tonne' : '+' + fmt(g) + ' t payload now');
    } else if (l) {
      var ready = E.rocketReady(s) && g > 0;
      l.el.disabled = !ready;
      setText(l.sub, !E.rocketReady(s) ? 'Build all four sections first'
        : g <= 0 ? 'Earn ' + fmt(E.creditsToNextTonne(s)) + ' more for the first tonne'
        : '+' + fmt(g) + ' t payload · income +' + fmt(Math.round(s.payload * b * 100)) + '% → +' + fmt(Math.round((s.payload + g) * b * 100)) + '%');
    }
  }

  function updateMore() {
    var s = G.s, P = SW.prog, d = rows.drop;
    if (d) {
      var ready = P.dropReady(s), step = ready ? P.dropStep(s) : s.daily.step;
      var def = C().dailyDrops[step];
      setText(d.title, (ready ? 'Day ' + (step + 1) + ': ' : 'Opened today. Next: ') + P.describeDrop(def));
      var rw = P.dropReward(s, step);
      setText(d.sub, (rw.credits ? fmt(rw.credits) + ' credits at your current rate. ' : '') + 'Missing a day steps back one day, not to the start.');
    }
    P.next(s, 3).forEach(function (x) {
      var r = rows['a-' + x.a.id]; if (!r) return;
      r.bar.style.transform = 'scaleX(' + x.frac.toFixed(3) + ')';
      setText(r.pct, Math.floor(x.frac * 100) + '%');
    });
    var r = rows.stats; if (!r) return;
    setText(r.total, fmt(s.totalEarned));
    setText(r.launches, String(s.launches));
    setText(r.payload, fmt(s.payload) + ' t');
    setText(r.time, SW.fmtDuration(s.playTime));
  }
})(typeof window !== 'undefined' ? window : globalThis);

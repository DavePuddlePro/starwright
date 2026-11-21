// Balance simulator: plays the game with a simple "buy the best value" strategy and prints when things happen.
// Run: node game/tools/simulate.js [hours]
require('../js/config.js');
require('../js/format.js');
require('../js/economy.js');
require('../js/moon.js');
const SW = globalThis.SW, E = SW.econ, C = SW.CONFIG;
const hours = parseFloat(process.argv[2] || '6');
const s = E.newState(0);
const events = [];
const t = (sec) => SW.fmtDuration(sec);
let sec = 0, launchedAt = 0;
const seenF = {};
let shopSeen = false, rocketSeen = false;
const step = 1;
for (; sec < hours * 3600; sec += step) {
  E.tick(s, step);
  const done = E.checkResearch(s, sec * 1000);
  if (done) events.push([sec, `  research done: ${done.name} ${E.researchLevel(s, done.id)}`]);
  if (E.researchOpen(s) && !s.research.active) {
    const opts = E.researchNext(s).sort((a, b) => a.hours[E.researchLevel(s, a.id)] - b.hours[E.researchLevel(s, b.id)]);
    if (opts.length) E.startResearch(s, opts[0].id, sec * 1000);
  }
  const MO = SW.moon;
  if (MO.open(s) && !s.moon.started) { MO.start(s); events.push([sec, 'MOON OPENS']); }
  if (s.moon.started && sec % 60 === 0) {
    for (let g = 0; g < 2000; g++) {
      let did = false;
      for (const b of C.moon.base) if (!s.moon.base[b.id] && s.moon.he3 >= b.cost) { MO.buyBase(s, b.id); did = true; }
      if (MO.fusionCost(s) <= s.moon.he3) { MO.buyFusion(s); events.push([sec, `  fusion ${s.moon.fusion}, payload ${SW.fmt(s.payload)}`]); continue; }
      let best = null, sc = 0;
      C.moon.rigs.forEach((r, i) => { if (!MO.rigRevealed(s, r, i)) return; const c = MO.rigCost(r, MO.rigCount(s, r.id), 1); if (c <= s.moon.he3 && r.rate / c > sc) { sc = r.rate / c; best = r; } });
      if (best) { MO.buyRig(s, best.id); did = true; }
      if (!did) break;
    }
  }
  if (s.moon.started && MO.autoReady(s)) { const g = E.launch(s, true); if (sec % 3600 < 2) events.push([sec, `  auto-launch +${SW.fmt(g)} t -> ${SW.fmt(s.payload)}`]); }
  const mc = E.modules(s).length;
  if (mc > (s._mods || 0)) { s._mods = mc; events.push([sec, `MODULE: ${E.modules(s)[mc - 1].name}`]); }
  // upgrades first
  let bought = true;
  while (bought) {
    bought = false;
    const shop = E.shopList(s);
    if (shop.length && E.shopUnlocked(s) && shop[0].cost <= s.credits) { E.buyUpgrade(s, shop[0].id); bought = true; }
  }
  if (!shopSeen && E.shopUnlocked(s)) { shopSeen = true; events.push([sec, 'Upgrade shop unlocks']); }
  if (!rocketSeen && E.rocketTabUnlocked(s)) { rocketSeen = true; events.push([sec, 'Rocket tab unlocks']); }
  const sect = E.nextSection(s);
  if (sect && s.credits >= E.sectionCost(s, sect)) { E.buySection(s, sect.id); events.push([sec, `  built ${sect.name} (${E.rocketName(s)})`]); }
  for (let guard = 0; guard < 500; guard++) {
    const id = E.bestValue(s, 1);
    if (!id) break;
    const f = E.factoryById(id);
    if (E.costFor(f, E.factoryCount(s, id), 1) > s.credits) break;
    // save up for the rocket if the next section is close
    if (sect && E.sectionCost(s, sect) < s.credits * 3 && E.costFor(f, E.factoryCount(s, id), 1) > s.credits * 0.1) break;
    E.buyFactory(s, id, 1);
    if (!seenF[s.launches + id]) { seenF[s.launches + id] = 1; if (s.launches === 0) events.push([sec, `first ${f.name}`]); }
  }
  if (E.rocketReady(s)) {
    const gain = E.payloadGain(s);
    if (gain >= Math.max(5, s.payload * 0.6)) {
      events.push([sec, `LAUNCH #${s.launches + 1}: +${gain} t (run ${t(sec - launchedAt)}), payload ${s.payload + gain}, rate before ${SW.fmt(E.totalRate(s))}/s`]);
      E.launch(s); launchedAt = sec;
    }
  }
}
for (const [when, what] of events) console.log(t(when).padStart(8), ' ', what);
console.log('\nEnd:', t(sec), 'credits', SW.fmt(s.credits), 'rate', SW.fmt(E.totalRate(s)) + '/s', 'payload', s.payload, 'launches', s.launches);
console.log('Counts:', C.factories.map(f => f.id + ':' + E.factoryCount(s, f.id)).join(' '));

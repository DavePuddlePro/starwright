// Helium-3 pacing: a player who checks in every few hours and spends everything.
// Run: node game/tools/simulate-moon.js [days] [hoursBetweenCheckIns]
require('../js/config.js'); require('../js/format.js'); require('../js/economy.js'); require('../js/moon.js');
const SW = globalThis.SW, M = SW.moon, C = SW.CONFIG.moon;
const days = parseFloat(process.argv[2] || '21'), gap = parseFloat(process.argv[3] || '4');
const s = { moon: M.fresh(), payload: 0 };
s.moon.started = true; s.moon.rigs.scoop = 1; s.moon.he3 = C.startHe3; s.moon.base.driver = true;
function spend() {
  for (let guard = 0; guard < 10000; guard++) {
    for (const b of C.base) if (!s.moon.base[b.id] && s.moon.he3 >= b.cost) { s.moon.base[b.id] = true; s.moon.he3 -= b.cost; log(`bought ${b.name}`); }
    if (M.fusionCost(s) <= s.moon.he3) { M.buyFusion(s); continue; }
    let best = null, score = 0;
    C.rigs.forEach((r, i) => {
      if (!M.rigRevealed(s, r, i)) return;
      const c = M.rigCost(r, M.rigCount(s, r.id), 1), sc = r.rate / c;
      if (c <= s.moon.he3 && sc > score) { score = sc; best = r; }
    });
    if (!best) return;
    M.buyRig(s, best.id);
  }
}
let t = 0;
const out = [];
function log(m) { out.push(`${SW.fmtDuration(t).padStart(8)}  ${m}`); }
let lastDay = -1;
// first session: active for an hour, spending every minute
for (; t < 3600; t += 60) { M.tick(s, 60); spend(); }
for (; t < days * 86400; t += gap * 3600) {
  M.tick(s, gap * 3600);
  spend();
  const d = Math.floor(t / 86400);
  if (d !== lastDay) { lastDay = d; log(`day ${d}: fusion ${s.moon.fusion} (income x${SW.fmt(M.fusionMult(s))}), rate ${SW.fmt(M.rate(s) * 3600)}/h, rigs ${C.rigs.map(r => M.rigCount(s, r.id)).join('/')}`); }
}
console.log(out.join('\n'));

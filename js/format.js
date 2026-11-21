/* Number and time formatting. */
(function (root) {
  var SW = root.SW = root.SW || {};
  var SUFFIX = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx'];

  // 1,234 -> 12.3 K -> 48.21 M ... Sx, then 1.23e24.
  SW.fmt = function (n, sci) {
    if (!isFinite(n)) return '∞';
    if (n < 0) return '-' + SW.fmt(-n, sci);
    if (n < 1000) {
      if (n < 10 && n % 1 !== 0) return n.toFixed(1);
      return Math.floor(n).toLocaleString('en-US');
    }
    var exp = Math.floor(Math.log10(n));
    if (sci || exp >= 24) {
      var m = n / Math.pow(10, exp);
      if (m >= 9.995) { m = 1; exp += 1; }
      return m.toFixed(2) + 'e' + exp;
    }
    var tier = Math.floor(exp / 3);
    var v = n / Math.pow(1000, tier);
    var digits = v >= 100 ? 1 : 2;
    var s = v.toFixed(digits);
    if (parseFloat(s) >= 1000 && tier + 1 < SUFFIX.length) { tier += 1; s = (v / 1000).toFixed(2); }
    return s + ' ' + SUFFIX[tier];
  };

  // 3:12:40 style clock.
  SW.fmtClock = function (sec) {
    sec = Math.max(0, Math.floor(sec));
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  };

  // "2h 14m" / "45s" style duration.
  SW.fmtDuration = function (sec) {
    sec = Math.max(0, Math.floor(sec));
    var d = Math.floor(sec / 86400), h = Math.floor((sec % 86400) / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    if (d) return d + 'd ' + h + 'h';
    if (h) return h + 'h ' + m + 'm';
    if (m) return m + 'm ' + (m < 10 && s ? s + 's' : '').trim();
    return s + 's';
  };

  // Cycle time: "1.5 s", "0.25 s"
  SW.fmtCycle = function (sec) {
    if (sec >= 60) return SW.fmtDuration(sec);
    return (sec >= 10 ? sec.toFixed(0) : sec >= 1 ? sec.toFixed(1).replace(/\.0$/, '') : sec.toFixed(2)) + ' s';
  };
})(typeof window !== 'undefined' ? window : globalThis);

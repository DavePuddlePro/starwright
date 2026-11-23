/*
 * Offline support. The app's files are saved on the phone the first time it loads.
 * After that, the game opens instantly from the saved copy (even with no signal), and quietly
 * fetches any newer version in the background, which is used the next time you open it.
 * Bump VERSION whenever you publish, so phones drop the old copy.
 */
var VERSION = 'starwright-0.7.6';
var APP_FILES = [
  './', 'index.html', 'manifest.webmanifest', 'css/style.css',
  'js/config.js', 'js/format.js', 'js/economy.js', 'js/progress.js', 'js/moon.js', 'js/mars.js', 'js/kestrel.js',
  'js/audio.js', 'js/art.js', 'js/art2.js', 'js/ui.js', 'js/main.js',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(APP_FILES.map(function (u) { return new Request(u, { cache: 'reload' }); })); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

// Serve from the saved copy straight away; refresh that copy from the network in the background.
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  var sameOrigin = url.origin === self.location.origin;
  var isFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (!sameOrigin && !isFont) return;
  e.respondWith(caches.open(VERSION).then(function (cache) {
    return cache.match(req, { ignoreSearch: sameOrigin }).then(function (hit) {
      var fresh = fetch(sameOrigin ? new Request(req, { cache: 'no-cache' }) : req).then(function (res) {
        if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
        return res;
      }).catch(function () { return hit; });
      return hit || fresh;
    });
  }));
});

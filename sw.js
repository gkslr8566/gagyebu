// 재정관리 서비스 워커: 화면 파일(같은 주소의 파일)만 저장한다.
// 시트 데이터(Apps Script 응답)는 건드리지 않는다 — 앱이 자체적으로 마지막 값을 기억한다.
// 화면 파일은 "인터넷 먼저, 안 되면 저장본" 방식이라 수정하면 다음 실행 때 바로 반영된다.
var CACHE = 'gagyebu-v1';
var FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // Apps Script 등 외부 요청은 그대로 통과
  e.respondWith(
    fetch(req).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(req, copy); });
      return res;
    }).catch(function () {
      return caches.match(req).then(function (hit) { return hit || caches.match('index.html'); });
    })
  );
});

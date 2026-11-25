// 재정관리 서비스 워커: 화면 파일(같은 주소의 파일)만 저장한다.
// 시트 데이터(Apps Script 응답)는 건드리지 않는다 — 앱이 자체적으로 마지막 값을 기억한다.
// 화면 파일은 "인터넷 먼저, 안 되면 저장본" 방식이라 수정하면 다음 실행 때 바로 반영된다.
var CACHE = 'gagyebu-v2';
var FILES = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "part-css-01.txt", "part-css-02.txt", "part-css-03.txt", "part-html-01.txt", "part-html-02.txt", "part-html-03.txt", "part-js-01.txt", "part-js-02.txt", "part-js-03.txt", "part-js-04.txt", "part-js-05.txt", "part-js-06.txt", "part-js-07.txt", "part-js-08.txt", "part-js-09.txt", "part-js-10.txt", "part-js-11.txt", "part-js-12.txt", "part-js-13.txt", "part-js-14.txt", "part-js-15.txt", "part-js-16.txt", "part-js-17.txt", "part-js-18.txt", "part-js-19.txt", "part-js-20.txt"];

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

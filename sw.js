// 버전 바꾸면 캐시 자동 갱신
const CACHE_VERSION = 'v7';
const CACHE_NAME = 'attendance-' + CACHE_VERSION;
const FILES = ['/'];

// 설치 — 캐시 저장
self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(FILES);
    })
  );
  self.skipWaiting();
});

// 활성화 — 구버전 캐시 삭제
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE_NAME; })
            .map(function(k){ return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// fetch — 네트워크 우선, 실패 시 캐시
self.addEventListener('fetch', function(e){
  e.respondWith(
    fetch(e.request).then(function(response){
      // 성공하면 캐시도 업데이트
      var clone = response.clone();
      caches.open(CACHE_NAME).then(function(cache){
        cache.put(e.request, clone);
      });
      return response;
    }).catch(function(){
      // 오프라인이면 캐시에서
      return caches.match(e.request);
    })
  );
});

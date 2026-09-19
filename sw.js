// Odat Marafoni -- offline-first service worker.
// Strategy: stale-while-revalidate. Serve instantly from cache when available
// (so the app opens offline / on a flaky connection), and refresh the cache
// in the background from the network for next time.
var CACHE_NAME = 'odat-marafoni-v4';
var CORE_ASSETS = ['index.html', 'manifest.json', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];

self.addEventListener('install', function(event){
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(CORE_ASSETS);
    }).catch(function(){ /* best-effort */ })
  );
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE_NAME; }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
      .then(function(){ return checkAndFireReminder(); })
  );
});

self.addEventListener('fetch', function(event){
  if(event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(function(cached){
      var network = fetch(event.request).then(function(response){
        if(response && response.status === 200 && response.type === 'basic'){
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache){ cache.put(event.request, clone); });
        }
        return response;
      }).catch(function(){ return cached; });
      return cached || network;
    })
  );
});

// ---------- daily reminder: best-effort background check ----------
// localStorage doesn't exist in a service worker, so the page mirrors just
// the reminder settings ({enabled, time, lastFiredDate}) into IndexedDB
// every time it persists (see idbSetReminder in the page script). This is
// the only store a service worker can read, which is what makes checking
// the reminder from here -- while the app itself is closed -- possible at
// all. This still only runs when Chrome decides to wake this service worker
// (periodicsync, or a fresh activate on next open) -- there is no way for a
// plain static page to guarantee an exact-time notification while fully
// closed; that needs a real push server, which this app doesn't have.

function idbGetReminder(){
  return new Promise(function(resolve){
    try{
      var req = indexedDB.open('odat-marafoni-db', 1);
      req.onupgradeneeded = function(){ try{ req.result.createObjectStore('kv'); }catch(e){} };
      req.onsuccess = function(){
        try{
          var tx = req.result.transaction('kv', 'readonly');
          var getReq = tx.objectStore('kv').get('reminder');
          getReq.onsuccess = function(){ resolve(getReq.result || null); };
          getReq.onerror = function(){ resolve(null); };
        }catch(e){ resolve(null); }
      };
      req.onerror = function(){ resolve(null); };
    }catch(e){ resolve(null); }
  });
}

function idbSetReminder(reminder){
  return new Promise(function(resolve){
    try{
      var req = indexedDB.open('odat-marafoni-db', 1);
      req.onupgradeneeded = function(){ try{ req.result.createObjectStore('kv'); }catch(e){} };
      req.onsuccess = function(){
        try{
          var tx = req.result.transaction('kv', 'readwrite');
          tx.objectStore('kv').put(reminder, 'reminder');
          tx.oncomplete = function(){ resolve(); };
          tx.onerror = function(){ resolve(); };
        }catch(e){ resolve(); }
      };
      req.onerror = function(){ resolve(); };
    }catch(e){ resolve(); }
  });
}

function pad2(n){ return (n < 10 ? '0' : '') + n; }
function todayISOLocal(){
  var d = new Date();
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
}

function checkAndFireReminder(){
  return idbGetReminder().then(function(reminder){
    if(!reminder || !reminder.enabled) return;
    var now = new Date();
    var hm = pad2(now.getHours()) + ':' + pad2(now.getMinutes());
    var today = todayISOLocal();
    if(hm >= (reminder.time || '20:00') && reminder.lastFiredDate !== today){
      return self.registration.showNotification('🏁 Odat Marafoni', {
        body: "Bugungi odatlaringizni belgilashni unutmang!",
        icon: 'icon-192.png',
        badge: 'icon-192.png'
      }).then(function(){
        reminder.lastFiredDate = today;
        return idbSetReminder(reminder);
      });
    }
  }).catch(function(){ /* best-effort */ });
}

self.addEventListener('periodicsync', function(event){
  if(event.tag === 'daily-reminder-check'){
    event.waitUntil(checkAndFireReminder());
  }
});

// ---------- real Web Push (works even when the app is fully closed) ----------
// This is the actual closed-app delivery mechanism: once the page has
// subscribed through the push-server (see push-server/ and its README), the
// browser's own push service wakes this service worker directly -- no open
// tab, no periodic-sync guesswork, no reliance on Chrome deciding to run a
// background check. The server controls timing/timezone; this handler's only
// job is to show whatever it was told to show.
self.addEventListener('push', function(event){
  var data = { title: '🏁 Odat Marafoni', body: "Bugungi odatlaringizni belgilashni unutmang!" };
  try{
    if(event.data){
      var parsed = event.data.json();
      if(parsed && (parsed.title || parsed.body)){
        data.title = parsed.title || data.title;
        data.body = parsed.body || data.body;
      }
    }
  }catch(e){
    try{ if(event.data) data.body = event.data.text() || data.body; }catch(e2){}
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: 'icon-192.png',
      badge: 'icon-192.png'
    })
  );
});

self.addEventListener('notificationclick', function(event){
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList){
      for(var i=0; i<clientList.length; i++){
        if('focus' in clientList[i]) return clientList[i].focus();
      }
      if(self.clients.openWindow) return self.clients.openWindow('index.html');
    })
  );
});

// sw.js — Caching completely disabled
self.addEventListener('install', function(event) {
  self.skipWaiting()
})

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(names.map(function(name) {
        console.log('Deleting cache:', name)
        return caches.delete(name)
      }))
    }).then(function() {
      return self.clients.claim()
    })
  )
})

// Pass everything to network — no caching at all
self.addEventListener('fetch', function(event) {
  event.respondWith(fetch(event.request))
})
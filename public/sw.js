// Service worker minimal — rend le site installable (PWA) et offre un repli hors-ligne léger.
const CACHE = 'vh-v2' // v2 : purge l'ancienne home figée (FR, CSS morts)
const OFFLINE_URLS = ['/']

self.addEventListener('install', (event) => {
  // On ne fige plus '/' à l'installation : la copie hors-ligne est rafraîchie
  // à CHAQUE navigation réussie (voir fetch) → jamais de page périmée.
  event.waitUntil(caches.open(CACHE))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  )
  self.clients.claim()
})

// Réseau d'abord, repli sur le cache si hors-ligne (uniquement pour les pages)
self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          // Copie fraîche pour le repli hors-ligne (remplace l'ancienne)
          if (res && res.ok) {
            const clone = res.clone()
            caches.open(CACHE).then((c) => c.put('/', clone)).catch(() => {})
          }
          return res
        })
        .catch(() => caches.match('/').then((r) => r || Response.error()))
    )
  }
})

// Notification Push (horaires de prière, même app fermée)
self.addEventListener('push', (event) => {
  let data = {}
  try { data = event.data ? event.data.json() : {} } catch (e) { data = {} }
  const title = data.title || '🕌 Heure de la prière'
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || '',
      icon: '/icon-192',
      badge: '/icon-192',
      tag: data.tag || 'prayer',
      vibrate: [200, 100, 200],
      data: { url: data.url || '/horaires-priere' },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) { if ('focus' in c) return c.focus() }
      return self.clients.openWindow(url)
    })
  )
})

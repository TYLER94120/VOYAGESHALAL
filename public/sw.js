// Service worker — le « natif » de la PWA : l'app (et surtout « Mes spots »)
// s'ouvre SANS connexion. Réseau d'abord partout → jamais de page périmée ;
// le cache n'est qu'un repli. /api n'est JAMAIS caché (données fraîches ;
// les favoris vivent dans localStorage → dispo hors-ligne par construction).
const CACHE = 'vh-v4' // v4 : /spots devient /trouvailles (un seul mot partout)
const OFFLINE_URLS = ['/', '/carnet', '/trouvailles', '/communaute/ajouter']

self.addEventListener('install', (event) => {
  // Précache best-effort des pages cœur (rafraîchies à chaque visite ensuite)
  event.waitUntil(
    caches.open(CACHE).then((c) => Promise.allSettled(OFFLINE_URLS.map((u) => c.add(u))))
  )
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
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/')) return // toujours frais, jamais caché

  // Assets fingerprintés + photos auto-hébergées : cache d'abord (immuables)
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/guides/')) {
    event.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res && res.ok) { const clone = res.clone(); caches.open(CACHE).then((c) => c.put(req, clone)).catch(() => {}) }
        return res
      }))
    )
    return
  }

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          // Copie fraîche PAR URL pour le repli hors-ligne
          if (res && res.ok) {
            const clone = res.clone()
            caches.open(CACHE).then((c) => c.put(url.pathname, clone)).catch(() => {})
          }
          return res
        })
        .catch(() =>
          caches.match(url.pathname)
            .then((r) => r || caches.match('/carnet')) // les spots persos avant tout
            .then((r) => r || caches.match('/'))
            .then((r) => r || Response.error())
        )
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

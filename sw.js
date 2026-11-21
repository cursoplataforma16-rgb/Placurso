// Service worker da Plataforma Curso: rede primeiro, cópia local se não houver Internet.
const CACHE = 'placurso-v1';
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || !r.url.startsWith(self.location.origin)) return;
  if (/\/functions\/v1\/|\/rest\/v1\//.test(r.url)) return;
  e.respondWith(fetch(r).then(res => {
    if (res.ok) { const c = res.clone(); caches.open(CACHE).then(ch => ch.put(r, c)); }
    return res;
  }).catch(() => caches.match(r).then(m => m || caches.match('/index.html'))));
});
self.addEventListener('push', e => {
  let d = {}; try { d = e.data.json(); } catch (_) {}
  e.waitUntil(self.registration.showNotification(d.title || 'Plataforma Curso', { body: d.body || '', icon: '/curso-icon-192.png', data: d.url || '/' }));
});
self.addEventListener('notificationclick', e => { e.notification.close(); e.waitUntil(clients.openWindow(e.notification.data || '/')); });

/* Service worker minimal : permet l'installation comme application et garde les fichiers du jeu en cache. */
const CACHE = 'nutriverse-v1';
const FILES = ['./', './index.html', './premium.css', './premium.js', './food3d.js', './icons3d.js', './qrcode.js', './lessons.js', './courses.js', './nutriverse-font.json', './characters.png', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== CACHE).map(n => caches.delete(n)))).then(() => self.clients.claim())); });
/* Réseau d'abord (pour toujours avoir la dernière version), cache si pas de connexion. */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(r => { if (r.ok && (new URL(e.request.url).origin === location.origin || e.request.url.includes('unpkg.com/three@'))) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return r; }).catch(() => caches.match(e.request)));
});

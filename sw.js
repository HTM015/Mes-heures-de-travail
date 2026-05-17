// ============================================
// SERVICE WORKER — Mes Heures CP 124
// Permet à l'appli de fonctionner SANS internet
// ============================================

const CACHE_NAME = 'mes-heures-v1';

// Tous les fichiers à mettre en cache pour le mode hors-ligne
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.png',
  'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
];

// Installation : mise en cache de tous les fichiers
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE).catch(() => {
        // Si un fichier externe échoue, on continue quand même
        return cache.addAll(['/', '/index.html', '/manifest.json']);
      });
    })
  );
  self.skipWaiting();
});

// Activation : suppression des anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Interception des requêtes : cache d'abord, réseau ensuite
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Mettre en cache les nouvelles ressources
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Si pas de réseau et pas de cache, retourner la page principale
        return caches.match('/index.html');
      });
    })
  );
});

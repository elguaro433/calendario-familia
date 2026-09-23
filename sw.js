// Service worker: "red primero". Con internet siempre carga la versión publicada
// (así no se queda una versión vieja en el móvil); sin internet usa la última copia guardada.
const CACHE = 'calendario-dg';
const BASICOS = ['./', './index.html', './compartido.js', './manifest.json', './icon-192.png', './icon-512.png'];
const HOSTS = [self.location.origin, 'https://www.gstatic.com', 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASICOS)).catch(() => {}));
});
self.addEventListener('activate', e => {
  e.waitUntil(Promise.all([
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))),
    self.clients.claim()
  ]));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  // Solo archivos de la app, Firebase SDK y fuentes; nunca los datos de Firestore ni el inicio de sesión
  if (req.method !== 'GET' || !HOSTS.includes(url.origin) || url.pathname.includes('/__/')) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      // Si la red tarda más de 6 s y hay copia guardada, usar la copia
      const red = fetch(req).then(res => { if (res.ok) cache.put(req, res.clone()); return res; });
      const lento = new Promise((_, rej) => setTimeout(() => rej(new Error('lento')), 6000));
      return await Promise.race([red, lento]).catch(async err => (await cache.match(req, { ignoreSearch: true })) || red);
    } catch (err) {
      return (await cache.match(req, { ignoreSearch: true })) || Response.error();
    }
  })());
});

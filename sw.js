const V = 'manolo-v4', FILES = ['./', 'index.html', 'style.css', 'app.js', 'interp.js', 'content.js', 'labs.js', 'notes.js', 'diagrams.js', 'notebook.js', 'manifest.webmanifest', 'icon.svg', 'legacy/handwritten_notebook_web_app.html'];
self.addEventListener('install', e => e.waitUntil(caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));

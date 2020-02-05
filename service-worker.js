const cacheName = 'v1';
const cacheKeepList = [cacheName];

addEventListener('install', evt => {
    console.log('[SW] installing service worker');

    // add pages to cache
    evt.waitUntil(
        caches.open(cacheName)
            .then(cache => {
                const routes = [
                    'index.html',
                    'restaurant.html',
                    'fallback.html',
                    'js/main.js',
                    'js/restaurant_info.js',
                    'css/styles.css',
                    'data/restaurants.json'
                ];

                // add the images to the routes
                const range = [];
                for (let i = 1; i <= 10; i++) {
                    range.push(i);
                }
                const imageRoutes = range.map(i => `img/${i}.jpg`);
                routes.push(...imageRoutes);

                return cache.addAll(routes)
            })
    )
});

addEventListener('activate', evt => {
    console.log('[SW] activating service worker');

    // delete old caches
    evt.waitUntil(
        caches.keys()
            .then(keys => {
                return Promise.all(
                    keys.map(key => {
                        if (!cacheKeepList.includes(key)) {
                            return caches.delete(key);
                        }
                    })
                );
            })
    );
});

addEventListener('fetch', evt => {
    console.log(`[SW] fetch: ${evt.request.url}`);

    // cache first strategy with fallback and no invalidation
    evt.respondWith(
        caches.match(evt.request)
            .then(cached => {
                return cached || fetch(evt.request.url)
                    .then(response => {
                        caches.open(cacheName).then(cache => cache.put(evt.request, response.clone()));
                        return response.clone();
                    });
            })
            .catch(reason => {
                return caches.match('fallback.html');
            })
    );
});

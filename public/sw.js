var CACHE_NAME = 'komori-v1';
var urlsToCache = [
  '/',
  '/#!',
  
  '/styles/fonts/Simple-Line-Icons.dev.svg',
  '/styles/fonts/Simple-Line-Icons.eot',
  '/styles/fonts/Simple-Line-Icons.svg',
  '/styles/fonts/Simple-Line-Icons.ttf',
  '/styles/fonts/Simple-Line-Icons.woff',

  '/styles/app.styles.css',
  '/styles/bootstrap.min.css',
  '/styles/simple-line-icons.css',

  '/scripts/angular.min.js',
  '/scripts/angular-ui-router.min.js',
  '/scripts/jquery-3.2.1.min.js',
  '/scripts/signature.js',

  '/app/app.controller.js',
  '/app/view.html',
  '/app/home.html',

   '/app.js',
   '/index.html'
];

self.addEventListener('install', function(event) {
  // Perform install steps
  console.log('***** Service Worker Installation *****');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  ); 
});

self.addEventListener('fetch', function(event) {
  console.log('***** Service Worker Fetch ***** | ');
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        
        if (response) {
          console.log('******* FETCH REQ |  '+ JSON.stringify(response));
          return response;
        }

        // IMPORTANT: Clone the request. A request is a stream and
        // can only be consumed once. Since we are consuming this
        // once by cache and once by the browser for fetch, we need
        // to clone the response.
        var fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.

            if(event.request.url.indexOf('/ping.html')=== -1){

                var responseToCache = response.clone();

                caches.open(CACHE_NAME)
                  .then(function(cache) {
                      cache.put(event.request, responseToCache);  
                  });

            }

            return response;


          }
        );
      })
    );
});

self.addEventListener('activate', function(event) {
  console.log('***** Service Worker Activation *****');
  var cacheWhitelist = ['komori-v1'];

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) !== -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
// اسم Cache
const CACHE_NAME = 'pwa-app-v1';

// الملفات التي سيتم تخزينها مؤقتاً
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './1.png',
  './2.png',
  './odio.mp4',
  './icon-192.png',
  './icon-512.png'
];

// تثبيت Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('تم فتح Cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('تم تخزين جميع الملفات');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('خطأ في تخزين الملفات:', error);
      })
  );
});

// تنشيط Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('حذف Cache القديم:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker تم تنشيطه بنجاح');
      return self.clients.claim();
    })
  );
});

// التعامل مع طلبات الشبكة
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // إذا وجد الملف في Cache، قم بإرجاعه
        if (response) {
          return response;
        }
        
        // إذا لم يوجد، قم بجلبه من الشبكة
        return fetch(event.request)
          .then(response => {
            // التحقق من صحة الاستجابة
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // تخزين الملف الجديد في Cache
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(error => {
            console.error('فشل في جلب الملف:', error);
            // إرجاع صفحة الخطأ إذا كان الملف مهماً
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html');
            }
          });
      })
  );
});

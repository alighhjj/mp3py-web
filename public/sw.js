const CACHE_NAME = 'music-player-v2';
const STATIC_CACHE = 'static-v2';
const MUSIC_CACHE = 'music-v2';

// 静态资源缓存列表
const staticAssets = [
  '/',
  '/style.css',
  '/player.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

/**
 * Service Worker 安装事件
 * 预缓存静态资源
 */
self.addEventListener('install', event => {
  console.log('Service Worker 安装中...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('缓存静态资源');
        return cache.addAll(staticAssets);
      })
      .then(() => self.skipWaiting())
  );
});

/**
 * Service Worker 激活事件
 * 清理旧缓存
 */
self.addEventListener('activate', event => {
  console.log('Service Worker 激活中...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== MUSIC_CACHE) {
            console.log('删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

/**
 * 网络请求拦截
 * 实现缓存优先策略
 */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // 处理音乐文件请求
  if (url.pathname.startsWith('/music/')) {
    event.respondWith(handleMusicRequest(request));
    return;
  }

  // 处理静态资源请求
  if (staticAssets.includes(url.pathname) || url.pathname === '/') {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // 其他请求使用网络优先策略
  event.respondWith(
    fetch(request).catch(() => {
      // 网络失败时返回离线页面
      if (request.mode === 'navigate') {
        return caches.match('/');
      }
    })
  );
});

/**
 * 处理音乐文件请求
 * 使用缓存优先策略，避免缓存部分响应
 */
async function handleMusicRequest(request) {
  const cache = await caches.open(MUSIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    console.log('从缓存返回音乐文件:', request.url);
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    
    // 只缓存完整响应（状态码200），不缓存部分响应（状态码206）
    if (networkResponse.ok && networkResponse.status === 200) {
      console.log('缓存音乐文件:', request.url);
      // 创建一个新的请求，确保不包含Range头
      const cacheRequest = new Request(request.url, {
        method: 'GET',
        headers: new Headers()
      });
      cache.put(cacheRequest, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('音乐文件加载失败:', error);
    throw error;
  }
}

/**
 * 处理静态资源请求
 * 使用缓存优先策略
 */
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('静态资源加载失败:', error);
    throw error;
  }
}

/* LeanNav 极简 Service Worker：只做静态资源缓存与离线兜底，不碰数据接口。
 * 站点配置 /nav-config.json 始终走网络，保证站长上传新配置后刷新即可生效。 */
const CACHE = 'leannav-shell-v3'
const CORE = [
  '/',
  '/navigator.png',
  '/navigator-dark.png',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/manifest.webmanifest',
]

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // 站点级配置与分享链接不做缓存
  if (url.pathname === '/nav-config.json') {
    event.respondWith(fetch(request))
    return
  }

  // 构建产物、品牌图标与本地图标是不可变资源，优先缓存
  if (url.pathname.startsWith('/_nuxt/') || url.pathname.startsWith('/icons/') ||
      /^\/(navigator|navigator-dark|icon-|apple-touch-icon|favicon)/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone()
          caches.open(CACHE).then((cache) => cache.put(request, copy))
        }
        return response
      }))
    )
    return
  }

  // 页面：网络优先，离线时回退到缓存（或首页）
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone()
          caches.open(CACHE).then((cache) => cache.put(request, copy))
        }
        return response
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
  )
})

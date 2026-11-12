/** 仅生产环境注册 Service Worker：开发服务器绝不能被缓存干扰。
 * 直接注册而不是等 window load —— 静态页常常在插件执行前就已触发 load，等事件会永远注册不上。 */
export default defineNuxtPlugin(() => {
  if (import.meta.dev || typeof window === 'undefined' || !('serviceWorker' in navigator)) return
  navigator.serviceWorker.register('/sw.js').catch(() => {})
})

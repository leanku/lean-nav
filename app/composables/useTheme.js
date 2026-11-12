import { ref } from 'vue'

/** 两个页面共享的主题状态。首屏 class 由 nuxt.config.ts 中的极早内联脚本决定，避免闪烁。 */
const isDark = ref(false)
const STORAGE_KEY = 'theme'

export function useTheme() {
  function apply(animate = true) {
    if (typeof document === 'undefined') return
    const html = document.documentElement
    if (animate) html.classList.add('theme-transition')
    html.classList.toggle('dark', isDark.value)
    // 系统 UI（地址栏 / 状态栏）跟随主题，避免亮色页面配深色浏览器 chrome
    document.querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', isDark.value ? '#0B0C0F' : '#F7F8FA')
    try { localStorage.setItem(STORAGE_KEY, isDark.value ? 'dark' : 'light') } catch (error) {}
    // 与 main.css 的 --dur-theme (380ms) 对齐，过渡未结束前不要摘掉 class
    if (animate) setTimeout(() => html.classList.remove('theme-transition'), 420)
  }

  function init() {
    if (typeof window === 'undefined') return
    let saved = null
    try { saved = localStorage.getItem(STORAGE_KEY) } catch (error) {}
    isDark.value = saved
      ? saved === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches
    apply(false)
  }

  function toggle() {
    isDark.value = !isDark.value
    apply()
  }

  return { isDark, init, toggle }
}
